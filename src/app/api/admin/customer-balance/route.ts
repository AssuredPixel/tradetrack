import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const customerName = searchParams.get("customerName");

        if (!customerName) {
            return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
        }

        await dbConnect();

        // Calculate total owed from credit supplies
        const totalOwedResult = await CreditSupply.aggregate([
            { $match: { customerName: customerName, deletedAt: null } },
            { $group: { _id: null, total: { $sum: "$totalAmountOwed" } } }
        ]);

        // Calculate total collected so far
        const totalCollectedResult = await Collection.aggregate([
            { $match: { customerName: customerName, deletedAt: null } },
            { $group: { _id: null, total: { $sum: "$amountCollected" } } }
        ]);

        const totalOwed = totalOwedResult[0]?.total || 0;
        const totalCollected = totalCollectedResult[0]?.total || 0;
        const balance = totalOwed - totalCollected;

        return NextResponse.json({ balance });

    } catch (error) {
        console.error("Error fetching customer balance:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
