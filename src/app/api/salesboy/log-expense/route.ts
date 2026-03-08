import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SALESBOY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { description, amount, notes, date } = body;

        if (!description || !amount || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        const newExpense = new Expense({
            date: new Date(date),
            description,
            amount,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newExpense.save();

        return NextResponse.json({ message: "Expense logged successfully", expense: newExpense }, { status: 201 });
    } catch (error) {
        console.error("Error logging expense:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
