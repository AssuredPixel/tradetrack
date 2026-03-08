import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Collection from "@/models/Collection";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { customerName, amountCollected, notes, date } = body;

        if (!customerName || !amountCollected || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const newCollection = new Collection({
            date: new Date(date),
            customerName,
            amountCollected,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newCollection.save();

        return NextResponse.json({ message: "Collection logged successfully", collection: newCollection }, { status: 201 });
    } catch (error) {
        console.error("Error logging collection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
