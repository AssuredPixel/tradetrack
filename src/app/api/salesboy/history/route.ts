import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import CreditSupply from "@/models/CreditSupply";
import Expense from "@/models/Expense";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "SALESBOY") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const username = (session.user as any).username;
        await dbConnect();

        // Aggregate Sales by Month
        const salesByMonth = await Sale.aggregate([
            {
                $match: {
                    submittedBy: username,
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalAmount: { $sum: "$totalAmount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        // Aggregate Credit Supplies by Month
        const creditsByMonth = await CreditSupply.aggregate([
            {
                $match: {
                    submittedBy: username,
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalAmountOwed: { $sum: "$totalAmountOwed" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        // Aggregate Expenses by Month
        const expensesByMonth = await Expense.aggregate([
            {
                $match: {
                    submittedBy: username,
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$date" },
                        month: { $month: "$date" }
                    },
                    totalAmount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": -1, "_id.month": -1 } }
        ]);

        // Merge results by Year/Month
        const historyMap: Record<string, any> = {};

        const addToMap = (data: any[], key: string, field: string) => {
            data.forEach(item => {
                const monthKey = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
                if (!historyMap[monthKey]) {
                    historyMap[monthKey] = {
                        month: monthKey,
                        sales: 0,
                        credits: 0,
                        expenses: 0,
                        salesCount: 0,
                        creditsCount: 0,
                        expensesCount: 0
                    };
                }
                historyMap[monthKey][key] = item[field];
                historyMap[monthKey][`${key}Count`] = item.count;
            });
        };

        addToMap(salesByMonth, "sales", "totalAmount");
        addToMap(creditsByMonth, "credits", "totalAmountOwed");
        addToMap(expensesByMonth, "expenses", "totalAmount");

        const history = Object.values(historyMap).sort((a, b) => b.month.localeCompare(a.month));

        return NextResponse.json({ history });

    } catch (error) {
        console.error("Error fetching salesboy history:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
