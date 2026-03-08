import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lodgment from "@/models/Lodgment";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { bankName, amount, notes, date } = body;

        if (!amount || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const newLodgment = new Lodgment({
            date: new Date(date),
            bankName,
            amount,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newLodgment.save();

        return NextResponse.json({ message: "Lodgment logged successfully", lodgment: newLodgment }, { status: 201 });
    } catch (error) {
        console.error("Error logging lodgment:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
