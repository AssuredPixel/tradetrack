import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";

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

        const newSale = new Sale({
            date: new Date(date),
            product,
            unitType,
            quantity,
            sellingPricePerUnit,
            totalAmount,
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
