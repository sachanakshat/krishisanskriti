import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { weekStart, title, maxSeats, notes } = body;

    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    const $set: Record<string, unknown> = {};
    if (weekStart !== undefined) $set.weekStart = weekStart;
    if (title !== undefined) $set.title = String(title).trim();
    if (maxSeats !== undefined) $set.maxSeats = Number(maxSeats);
    if (notes !== undefined) $set.notes = String(notes);

    await db.collection("batches").updateOne({ _id: new ObjectId(id) }, { $set });

    // Cascade weekStart to all registrations in this batch
    if (weekStart !== undefined) {
      await db.collection("registrations").updateMany(
        { batchId: id },
        { $set: { batchWeekStart: weekStart } }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Batch PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    // Unassign all attendees from this batch
    await db.collection("registrations").updateMany(
      { batchId: id },
      { $unset: { batchId: "", batchWeekStart: "" } }
    );

    await db.collection("batches").deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Batch DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
