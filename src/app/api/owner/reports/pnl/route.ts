import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
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

        // 1. Fetch Sales in period to get Revenue and COGS
        const sales = await Sale.find(query).lean();
        let totalSalesRevenue = 0;
        let totalCOGS = 0;

        sales.forEach(sale => {
            totalSalesRevenue += sale.totalAmount;
            totalCOGS += (sale.totalCOGS || 0);
        });

        // 2. Fetch Expenses in period
        const expenses = await Expense.find(query).lean();
        let totalExpenses = 0;

        expenses.forEach(expense => {
            totalExpenses += expense.amount;
        });

        // 3. Calculate Profitability
        const grossProfit = totalSalesRevenue - totalCOGS;
        const netProfit = grossProfit - totalExpenses;

        return NextResponse.json({
            period: { start, end },
            totalSalesRevenue,
            totalCOGS,
            grossProfit,
            totalExpenses,
            netProfit
        });

    } catch (error) {
        console.error("Error fetching PnL report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
