import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lodgment from "@/models/Lodgment";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limiter";

const lodgmentSchema = z.object({
    bankName: z.string().optional(),
    amount: z.number().positive(),
    notes: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting for lodgments
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 10, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Too many lodgment requests. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        const validation = lodgmentSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues.map(e => e.message) 
            }, { status: 400 });
        }

        const { bankName, amount, notes, date } = validation.data;

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
