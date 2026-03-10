import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Expense from "@/models/Expense";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limiter";

const expenseSchema = z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
    notes: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SALESBOY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting for transactions
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 20, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Too many expense logs. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        const validation = expenseSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues.map(e => e.message) 
            }, { status: 400 });
        }

        const { description, amount, notes, date } = validation.data;

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
