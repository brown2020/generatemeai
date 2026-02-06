import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { z } from "zod";
import { normalizeValue } from "@/utils/imageUtils";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_URL_HOSTS = [
  "storage.googleapis.com",
  "firebasestorage.googleapis.com",
];

const previewSchema = z.object({
  imageUrl: z.string().url(),
  type: z.string().min(1).max(50),
  value: z.string().min(1).max(200),
});

function isAllowedUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return ALLOWED_URL_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`)
    );
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING !== "true") {
    return NextResponse.json(
      { error: "Preview marking is disabled" },
      { status: 403 }
    );
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

    if (!isAllowedUrl(imageUrl)) {
      return NextResponse.json(
        { error: "URL not allowed" },
        { status: 400 }
      );
    }

    const sanitizedType = type.replace(/[^a-zA-Z]/g, "");
    if (!sanitizedType) {
      return NextResponse.json(
        { error: "Invalid type" },
        { status: 400 }
      );
    }

    const normalizedValue = normalizeValue(value);
    const previewDir = path.join(
      process.cwd(),
      "public",
      "previews",
      sanitizedType,
      normalizedValue
    );

    // Ensure the resolved path is within the expected directory
    const expectedBase = path.join(process.cwd(), "public", "previews");
    if (!previewDir.startsWith(expectedBase)) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    if (fs.existsSync(previewDir)) {
      fs.rmSync(previewDir, { recursive: true, force: true });
    }

    fs.mkdirSync(previewDir, { recursive: true });

    const response = await fetch(imageUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: 502 }
      );
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 400 }
      );
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image too large" },
        { status: 400 }
      );
    }

    const filePath = path.join(previewDir, "1.jpg");
    fs.writeFileSync(filePath, Buffer.from(buffer));

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