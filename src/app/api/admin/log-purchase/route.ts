import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { product, unitType, quantity, purchasePricePerUnit, totalCost, supplierName, notes, date } = body;

        if (!product || !unitType || !quantity || !purchasePricePerUnit || !totalCost || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

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
