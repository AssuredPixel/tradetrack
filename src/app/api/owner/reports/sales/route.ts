import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
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

        const sales = await Sale.find(query).sort({ date: -1, submittedAt: -1 }).lean();

        let totalRevenue = 0;
        const productStats: Record<string, { quantity: number; revenue: number; }> = {};

        sales.forEach(sale => {
            totalRevenue += sale.totalAmount;

            if (!productStats[sale.product]) {
                productStats[sale.product] = { quantity: 0, revenue: 0 };
            }
            productStats[sale.product].quantity += sale.quantity;
            productStats[sale.product].revenue += sale.totalAmount;
        });

        const breakdown = Object.entries(productStats).map(([product, stats]) => ({
            product,
            quantity: stats.quantity,
            revenue: stats.revenue,
            avgPrice: stats.quantity > 0 ? stats.revenue / stats.quantity : 0
        })).sort((a, b) => b.revenue - a.revenue);

        return NextResponse.json({
            period: { start, end },
            totalRevenue,
            breakdown,
            entries: sales
        });

    } catch (error) {
        console.error("Error fetching owner sales report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
