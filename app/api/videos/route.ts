import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/videos  — returns all video posts sorted by publishedAt desc
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    const videos = await db
      .collection("videos")
      .find({})
      .sort({ publishedAt: -1 })
      .toArray();

    return NextResponse.json(
      videos.map((v) => ({ ...v, _id: v._id.toString() }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch videos" }, { status: 500 });
  }
}

// POST /api/videos  — create a new video post (admin use)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId, title, titleHi, description, descriptionHi, blogContent, blogContentHi, publishedAt } = body;

    if (!videoId || !title || !description || !blogContent) {
      return NextResponse.json(
        { error: "videoId, title, description and blogContent are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    const collection = db.collection("videos");

    // Upsert by videoId so re-posting the same video just updates it
    const result = await collection.updateOne(
      { videoId },
      {
        $set: {
          videoId,
          title: title.trim(),
          titleHi: titleHi?.trim() || "",
          description: description.trim(),
          descriptionHi: descriptionHi?.trim() || "",
          blogContent: blogContent.trim(),
          blogContentHi: blogContentHi?.trim() || "",
          publishedAt: publishedAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        $setOnInsert: { createdAt: new Date().toISOString() },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, result }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save video post" }, { status: 500 });
  }
}
