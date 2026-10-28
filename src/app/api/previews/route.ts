import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { getAuthContext } from "@/utils/serverAuth";
import { fetchChecked, isAllowedStorageUrl, MAX_IMAGE_BYTES } from "@/utils/storageUrl";
import { previewAdminUids, previewDirectory } from "@/utils/previewPath";

const previewSchema = z.object({
  imageUrl: z.string().url(),
  type: z.string().min(1).max(50),
  value: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING !== "true") {
    return NextResponse.json(
      { error: "Preview marking is disabled" },
      { status: 403 }
    );
  }

  let uid: string;
  try {
    uid = (await getAuthContext()).uid;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!previewAdminUids().includes(uid)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const parsed = previewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    const { imageUrl, type, value } = parsed.data;

    if (!isAllowedStorageUrl(imageUrl)) {
      return NextResponse.json(
        { error: "URL not allowed" },
        { status: 400 }
      );
    }

    const previewDir = previewDirectory(type, value);
    if (!previewDir) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    let buffer: Buffer;
    try {
      buffer = await fetchChecked(imageUrl, {
        maxBytes: MAX_IMAGE_BYTES,
        allow: isAllowedStorageUrl,
      });
    } catch {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 }
      );
    }

    if (fs.existsSync(previewDir)) {
      fs.rmSync(previewDir, { recursive: true, force: true });
    }

    fs.mkdirSync(previewDir, { recursive: true });

    const filePath = path.join(previewDir, "1.jpg");
    fs.writeFileSync(filePath, buffer);

    const normalizedValue = path.basename(previewDir);
    const sanitizedType = path.basename(path.dirname(previewDir));

    return NextResponse.json({
      success: true,
      path: `/previews/${sanitizedType}/${normalizedValue}/1.jpg`,
    });
  } catch (error) {
    console.error("Error saving preview:", error);
    return NextResponse.json(
      { error: "Failed to save preview" },
      { status: 500 }
    );
  }
}
