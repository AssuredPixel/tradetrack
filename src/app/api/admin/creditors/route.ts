import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Aggregate total owed per customer
        const creditTotals = await CreditSupply.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: "$customerName", totalOwed: { $sum: "$totalAmountOwed" } } }
        ]);

        // Aggregate total collected per customer
        const collectionTotals = await Collection.aggregate([
            { $match: { deletedAt: null } },
            { $group: { _id: "$customerName", totalCollected: { $sum: "$amountCollected" } } }
        ]);

        // Merge results and filter for those with remaining balance
        const creditorsMap: Record<string, number> = {};

        creditTotals.forEach(item => {
            creditorsMap[item._id] = item.totalOwed;
        });

        collectionTotals.forEach(item => {
            if (creditorsMap[item._id]) {
                creditorsMap[item._id] -= item.totalCollected;
            } else {
                // Should not happen normally if they only have collections, but for safety:
                creditorsMap[item._id] = -item.totalCollected;
            }
        });

        const creditors = Object.entries(creditorsMap)
            .filter(([_, balance]) => balance > 0)
            .map(([name, balance]) => ({ name, balance }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({ creditors });

    } catch (error) {
        console.error("Error fetching creditors:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
