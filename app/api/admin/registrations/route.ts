import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET /api/admin/registrations  — list all, with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() ?? "";
    const state = searchParams.get("state")?.trim() ?? "";
    const district = searchParams.get("district")?.trim() ?? "";
    const payment = searchParams.get("payment")?.trim() ?? "";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { village: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (state) filter.state = { $regex: state, $options: "i" };
    if (district) filter.district = { $regex: district, $options: "i" };
    if (payment) filter.paymentStatus = payment;

    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    const docs = await db
      .collection("registrations")
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(
      docs.map((d) => ({ ...d, _id: d._id.toString() }))
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
  }
}

// PATCH /api/admin/registrations  — update paymentStatus and/or batch assignment
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, paymentStatus, batchId, batchWeekStart } = body;
    if (!id) {
      return NextResponse.json({ error: "id required" }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: Record<string, any> = {};
    if (paymentStatus !== undefined) updates.paymentStatus = paymentStatus;
    if (batchId !== undefined) updates.batchId = batchId ?? null;
    if (batchWeekStart !== undefined) updates.batchWeekStart = batchWeekStart ?? null;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
    }
    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    await db.collection("registrations").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

// DELETE /api/admin/registrations?id=...
export async function DELETE(req: NextRequest) {
  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const { ObjectId } = await import("mongodb");
    const client = await clientPromise;
    const db = client.db("krishisanskriti");
    await db.collection("registrations").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
