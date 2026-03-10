import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CreditSupply from "@/models/CreditSupply";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limiter";

const creditSchema = z.object({
    customerName: z.string().min(1),
    product: z.string().min(1),
    unitType: z.string().min(1),
    quantity: z.number().positive(),
    agreedPricePerUnit: z.number().positive(),
    totalAmountOwed: z.number().positive(),
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
            return NextResponse.json({ error: "Too many credit supply logs. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        const validation = creditSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues.map(e => e.message) 
            }, { status: 400 });
        }

        const { customerName, product, unitType, quantity, agreedPricePerUnit, totalAmountOwed, notes, date } = validation.data;

        await dbConnect();

        const newCredit = new CreditSupply({
            date: new Date(date),
            customerName,
            product,
            unitType,
            quantity,
            agreedPricePerUnit,
            totalAmountOwed,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newCredit.save();

        return NextResponse.json({ message: "Credit supply logged successfully", credit: newCredit }, { status: 201 });
    } catch (error) {
        console.error("Error logging credit supply:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
