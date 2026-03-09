import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import { getDateRangeFromParams } from "@/lib/date-utils";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const { start, end } = getDateRangeFromParams(url.searchParams);

        await dbConnect();

        const query = {
            date: { $gte: start, $lte: end },
            deletedAt: null
        };

        const purchases = await Purchase.find(query).sort({ date: -1, submittedAt: -1 }).lean();

        let totalCost = 0;
        const productStats: Record<string, { quantity: number; cost: number; }> = {};

        purchases.forEach(purchase => {
            totalCost += purchase.totalCost;

            if (!productStats[purchase.product]) {
                productStats[purchase.product] = { quantity: 0, cost: 0 };
            }
            productStats[purchase.product].quantity += purchase.quantity;
            productStats[purchase.product].cost += purchase.totalCost;
        });

        const breakdown = Object.entries(productStats).map(([product, stats]) => ({
            product,
            quantity: stats.quantity,
            cost: stats.cost,
            avgPrice: stats.quantity > 0 ? stats.cost / stats.quantity : 0
        })).sort((a, b) => b.cost - a.cost);

        return NextResponse.json({
            period: { start, end },
            totalCost,
            breakdown,
            entries: purchases
        });

    } catch (error) {
        console.error("Error fetching owner purchases report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
