import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { normalizeValue } from "@/utils/imageUtils";

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_ENABLE_PREVIEW_MARKING !== 'true') {
    return NextResponse.json(
      { error: 'Preview marking is disabled' }, 
      { status: 403 }
    );
  }

  try {
    const { imageUrl, type, value } = await request.json();

    const sanitizedType = type.replace(/[^a-zA-Z]/g, '');
    const normalizedValue = normalizeValue(value);
    
    const previewDir = path.join(process.cwd(), 'public', 'previews', sanitizedType, normalizedValue);
    
    if (fs.existsSync(previewDir)) {
      fs.rmSync(previewDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(previewDir, { recursive: true });

    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');
    
    const buffer = await response.arrayBuffer();
    const filePath = path.join(previewDir, '1.jpg');
    
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return NextResponse.json({ 
      success: true,
      path: `/previews/${sanitizedType}/${normalizedValue}/1.jpg`
    });
  } catch (error) {
    console.error('Error saving preview:', error);
    return NextResponse.json({ error: 'Failed to save preview' }, { status: 500 });
  }
} 