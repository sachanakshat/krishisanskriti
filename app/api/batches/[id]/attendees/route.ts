import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    const attendees = await db
      .collection("registrations")
      .find({ batchId: id })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      attendees.map((a) => ({
        ...a,
        _id: a._id.toString(),
        createdAt: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
      }))
    );
  } catch (err) {
    console.error("Attendees GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Move an attendee to a different batch */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { registrationId, newBatchId } = await req.json();
    if (!registrationId || !newBatchId)
      return NextResponse.json({ error: "registrationId and newBatchId required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    const newBatch = await db.collection("batches").findOne({ _id: new ObjectId(newBatchId) });
    if (!newBatch) return NextResponse.json({ error: "Target batch not found" }, { status: 404 });

    const seatCount = await db.collection("registrations").countDocuments({ batchId: newBatchId });
    if (seatCount >= (newBatch.maxSeats ?? 32))
      return NextResponse.json({ error: "Target batch is full" }, { status: 400 });

    await db.collection("registrations").updateOne(
      { _id: new ObjectId(registrationId) },
      { $set: { batchId: newBatchId, batchWeekStart: newBatch.weekStart } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attendee PATCH error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/** Remove an attendee from a batch (unassigns without deleting) */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const regId = new URL(req.url).searchParams.get("regId");
    if (!regId) return NextResponse.json({ error: "regId required" }, { status: 400 });

    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    await db.collection("registrations").updateOne(
      { _id: new ObjectId(regId), batchId: id },
      { $unset: { batchId: "", batchWeekStart: "" } }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Attendee DELETE error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
