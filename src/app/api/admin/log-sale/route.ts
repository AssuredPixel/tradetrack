import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limiter";

const saleSchema = z.object({
    product: z.string().min(1),
    unitType: z.string().min(1),
    quantity: z.number().positive(),
    sellingPricePerUnit: z.number().positive(),
    totalAmount: z.number().positive(),
    notes: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting for transactions
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 30, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Transaction limit reached. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        const validation = saleSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues.map(e => e.message) 
            }, { status: 400 });
        }

        const { product, unitType, quantity, sellingPricePerUnit, totalAmount, notes, date } = validation.data;

        await dbConnect();

        // --- FIFO Cost Price Lookup ---
        const latestPurchase = await Purchase.findOne(
            { product, deletedAt: null },
            { purchasePricePerUnit: 1 }
        ).sort({ submittedAt: -1 }).lean();

        const costPricePerUnit = latestPurchase?.purchasePricePerUnit || 0;
        const totalCOGS = costPricePerUnit * Number(quantity);

        const newSale = new Sale({
            date: new Date(date),
            product,
            unitType,
            quantity,
            sellingPricePerUnit,
            totalAmount,
            costPricePerUnit,
            totalCOGS,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newSale.save();

        return NextResponse.json({ message: "Sale logged successfully", sale: newSale }, { status: 201 });
    } catch (error) {
        console.error("Error logging sale:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
