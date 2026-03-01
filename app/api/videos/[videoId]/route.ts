import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/videos/[videoId]  — returns a single video post
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    const video = await db.collection("videos").findOne({ videoId });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json({ ...video, _id: video._id.toString() });
  } catch {
    return NextResponse.json({ error: "Failed to fetch video" }, { status: 500 });
  }
}

// DELETE /api/videos/[videoId]  — delete a video post
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    await db.collection("videos").deleteOne({ videoId });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete video" }, { status: 500 });
  }
}
