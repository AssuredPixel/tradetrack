import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { subDays, startOfDay, endOfDay } from "date-fns";
import Purchase from "@/models/Purchase";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";
import Sale from "@/models/Sale";
import CreditSupply from "@/models/CreditSupply";
import Expense from "@/models/Expense";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const timeframe = searchParams.get("timeframe") || "7days"; // '7days', '30days', 'all'

        await dbConnect();

        let dateQuery: any = { deletedAt: null };

        if (timeframe !== "all") {
            const todayEnd = endOfDay(new Date());
            const daysOffset = timeframe === "30days" ? 30 : 7;
            const pastStart = startOfDay(subDays(new Date(), daysOffset));
            dateQuery.submittedAt = { $gte: pastStart, $lte: todayEnd };
        }

        // Fetch data simultaneously
        const [purchases, collections, lodgments, sales, credits, expenses] = await Promise.all([
            Purchase.find(dateQuery).sort({ submittedAt: -1 }).lean(),
            Collection.find(dateQuery).sort({ submittedAt: -1 }).lean(),
            Lodgment.find(dateQuery).sort({ submittedAt: -1 }).lean(),
            Sale.find(dateQuery).sort({ submittedAt: -1 }).lean(),
            CreditSupply.find(dateQuery).sort({ submittedAt: -1 }).lean(),
            Expense.find(dateQuery).sort({ submittedAt: -1 }).lean(),
        ]);

        return NextResponse.json({
            adminActivity: { purchases, collections, lodgments },
            salesboyActivity: { sales, credits, expenses },
        });

    } catch (error) {
        console.error("Error fetching audit logs:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
