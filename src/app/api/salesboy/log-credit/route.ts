import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CreditSupply from "@/models/CreditSupply";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SALESBOY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { customerName, product, unitType, quantity, agreedPricePerUnit, totalAmountOwed, notes, date } = body;

        if (!customerName || !product || !unitType || !quantity || !agreedPricePerUnit || !totalAmountOwed || !date) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

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
