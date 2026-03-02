import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    const batches = await db.collection("batches").find({}).sort({ weekStart: 1 }).toArray();

    const counts = await db
      .collection("registrations")
      .aggregate([
        { $match: { batchId: { $exists: true, $ne: null, $type: "string" } } },
        { $group: { _id: "$batchId", count: { $sum: 1 } } },
      ])
      .toArray();

    const countMap: Record<string, number> = {};
    counts.forEach((c) => { if (c._id) countMap[String(c._id)] = c.count; });

    return NextResponse.json(
      batches.map((b) => ({
        _id: b._id.toString(),
        weekStart: b.weekStart,
        title: b.title,
        maxSeats: b.maxSeats ?? 32,
        notes: b.notes ?? "",
        createdAt: b.createdAt,
        registrationCount: countMap[b._id.toString()] ?? 0,
        seatsLeft: (b.maxSeats ?? 32) - (countMap[b._id.toString()] ?? 0),
      }))
    );
  } catch (err) {
    console.error("Batches GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { weekStart, title, maxSeats = 32, notes = "" } = await req.json();
    if (!weekStart || !title)
      return NextResponse.json({ error: "weekStart and title required" }, { status: 400 });

    const d = new Date(weekStart + "T00:00:00");
    if (isNaN(d.getTime()) || d.getDay() !== 1)
      return NextResponse.json({ error: "weekStart must be a Monday (YYYY-MM-DD)" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    const result = await db.collection("batches").insertOne({
      weekStart: String(weekStart),
      title: String(title).trim(),
      maxSeats: Number(maxSeats) || 32,
      notes: String(notes).trim(),
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, id: result.insertedId.toString() }, { status: 201 });
  } catch (err) {
    console.error("Batches POST error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
