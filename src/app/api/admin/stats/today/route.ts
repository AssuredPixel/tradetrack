import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const username = (session.user as any).username;
        await dbConnect();

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        const query = {
            submittedBy: username,
            date: { $gte: todayStart, $lte: todayEnd },
            deletedAt: null
        };

        const [purchaseStats, collectionStats, lodgmentStats] = await Promise.all([
            Purchase.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$totalCost" } } }
            ]),
            Collection.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$amountCollected" } } }
            ]),
            Lodgment.aggregate([
                { $match: query },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        return NextResponse.json({
            totalPurchased: purchaseStats[0]?.total || 0,
            totalCollected: collectionStats[0]?.total || 0,
            totalLodged: lodgmentStats[0]?.total || 0
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
