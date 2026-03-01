import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, village, district, state, phone, land } = body;

    if (!name || !village || !district || !state || !phone || !land) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("sanatankrishi");
    const collection = db.collection("registrations");

    const result = await collection.insertOne({
      name: String(name).trim(),
      village: String(village).trim(),
      district: String(district).trim(),
      state: String(state).trim(),
      phone: String(phone).trim(),
      land: parseFloat(land),
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
