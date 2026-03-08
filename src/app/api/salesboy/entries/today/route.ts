import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import CreditSupply from "@/models/CreditSupply";
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

        const query = {
            submittedBy: username,
            date: { $gte: todayStart, $lte: todayEnd },
            deletedAt: null
        };

        const [sales, creditSupplies, expenses] = await Promise.all([
            Sale.find(query).sort({ submittedAt: -1 }),
            CreditSupply.find(query).sort({ submittedAt: -1 }),
            Expense.find(query).sort({ submittedAt: -1 })
        ]);

        return NextResponse.json({ sales, creditSupplies, expenses });
    } catch (error) {
        console.error("Error fetching today's entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
