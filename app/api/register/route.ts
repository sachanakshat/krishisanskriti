import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, village, district, state, phone, land, batchId, batchWeekStart } = body;

    if (!name || !village || !district || !state || !phone || !land) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("krishisanskriti");

    // Seat-limit check
    if (batchId) {
      try {
        const batch = await db.collection("batches").findOne({ _id: new ObjectId(String(batchId)) });
        if (batch) {
          const count = await db.collection("registrations").countDocuments({ batchId: String(batchId) });
          if (count >= (batch.maxSeats ?? 32)) {
            return NextResponse.json({ error: "Batch is full" }, { status: 409 });
          }
        }
      } catch {
        // Invalid ObjectId — ignore seat check
      }
    }

    const result = await db.collection("registrations").insertOne({
      name: String(name).trim(),
      village: String(village).trim(),
      district: String(district).trim(),
      state: String(state).trim(),
      phone: String(phone).trim(),
      land: parseFloat(land),
      batchId: batchId ? String(batchId) : null,
      batchWeekStart: batchWeekStart ? String(batchWeekStart) : null,
      paymentStatus: "pending",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { success: true, id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
