import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limiter";

const purchaseSchema = z.object({
    product: z.string().min(1),
    unitType: z.string().min(1),
    quantity: z.number().positive(),
    purchasePricePerUnit: z.number().positive(),
    totalCost: z.number().positive(),
    supplierName: z.string().optional(),
    notes: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting for purchase logging
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 20, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Too many purchase logs. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        const validation = purchaseSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues.map(e => e.message) 
            }, { status: 400 });
        }

        const { product, unitType, quantity, purchasePricePerUnit, totalCost, supplierName, notes, date } = validation.data;

        await dbConnect();

        const newPurchase = new Purchase({
            date: new Date(date),
            product,
            unitType,
            quantity,
            purchasePricePerUnit,
            totalCost,
            supplierName,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newPurchase.save();

        return NextResponse.json({ message: "Purchase logged successfully", purchase: newPurchase }, { status: 201 });
    } catch (error) {
        console.error("Error logging purchase:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
