import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
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

        const expenses = await Expense.find(query).sort({ date: -1, submittedAt: -1 }).lean();

        let totalExpenses = 0;

        expenses.forEach(expense => {
            totalExpenses += expense.amount;
        });

        return NextResponse.json({
            period: { start, end },
            totalExpenses,
            entries: expenses
        });

    } catch (error) {
        console.error("Error fetching owner expenses report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
