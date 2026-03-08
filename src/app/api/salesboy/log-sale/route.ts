import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SALESBOY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { product, unitType, quantity, sellingPricePerUnit, totalAmount, notes, date } = body;

        if (!product || !unitType || !quantity || !sellingPricePerUnit || !totalAmount || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        // --- FIFO Cost Price Lookup ---
        // Find the most recent Purchase for this product to snapshot the current cost price.
        // This is set by the Junior Brother (Admin) when restocking. The Salesboy does NOT
        // need to know or input this — it's automatic.
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
            costPricePerUnit,  // Snapshotted from latest Purchase at time of sale
            totalCOGS,         // Exact COGS for this sale transaction
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
