import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SALESBOY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const username = (session.user as any).username;
        await dbConnect();

        const todayStart = startOfDay(new Date());
        const todayEnd = endOfDay(new Date());

        // Aggregate Sales
        const salesStats = await Sale.aggregate([
            {
                $match: {
                    submittedBy: username,
                    date: { $gte: todayStart, $lte: todayEnd },
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: null,
                    totalSalesAmount: { $sum: "$totalAmount" },
                    transactionCount: { $sum: 1 }
                }
            }
        ]);

        // Aggregate Expenses
        const expenseStats = await Expense.aggregate([
            {
                $match: {
                    submittedBy: username,
                    date: { $gte: todayStart, $lte: todayEnd },
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: null,
                    totalExpenses: { $sum: "$amount" }
                }
            }
        ]);

        return NextResponse.json({
            totalSalesAmount: salesStats[0]?.totalSalesAmount || 0,
            transactionCount: salesStats[0]?.transactionCount || 0,
            totalExpenses: expenseStats[0]?.totalExpenses || 0
        });

    } catch (error) {
        console.error("Error fetching salesboy stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
