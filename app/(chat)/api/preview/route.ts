import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { updateChatPreviewUrl } from "@/lib/db/queries";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "BLOB_READ_WRITE_TOKEN is not configured. Add it to your environment variables to enable preview image capture." },
      { status: 500 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let chatId: string;
  let imageData: string;
  try {
    const body = await request.json();
    chatId = body.chatId;
    imageData = body.imageData;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!chatId || !imageData) {
    return NextResponse.json({ error: "chatId and imageData are required" }, { status: 400 });
  }

  const base64 = imageData.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  try {
    const { url } = await put(`previews/${chatId}.jpg`, buffer, {
      access: "public",
      contentType: "image/jpeg",
    });

    await updateChatPreviewUrl({ chatId, previewUrl: url });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[preview-upload] failed:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
