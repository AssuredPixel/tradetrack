import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import StartingCapital from "@/models/StartingCapital";
import Purchase from "@/models/Purchase";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";
import { generateBusinessInsight } from "@/lib/ai-service";

import { rateLimit } from "@/lib/rate-limiter";
import { z } from "zod";

const promptSchema = z.object({
    prompt: z.string().min(1).max(500, "Prompt must be 500 characters or less"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Strict rate limit — each request hits a paid external API
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 10, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Too many AI requests. Please wait a minute before asking again." }, { status: 429 });
        }

        const body = await req.json();
        const validation = promptSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: validation.error.issues[0].message 
            }, { status: 400 });
        }

        const { prompt } = validation.data;

        await dbConnect();

        const targetYear = new Date().getFullYear();
        const start = startOfYear(new Date(targetYear, 0, 1));
        const end = endOfYear(new Date(targetYear, 0, 1));
        const ytdQuery = { submittedAt: { $gte: start, $lte: end }, deletedAt: null };

        // Aggregate core business metrics (similar to dashboard-stats but more detailed for AI context)
        const [
            startingCapital,
            purchases,
            sales,
            expenses,
            allCredits,
            allCollections,
            lodgments
        ] = await Promise.all([
            StartingCapital.findOne({ year: targetYear }).lean(),
            Purchase.find(ytdQuery).lean(),
            Sale.find(ytdQuery).lean(),
            Expense.find(ytdQuery).lean(),
            CreditSupply.find({ deletedAt: null }).lean(),
            Collection.find({ deletedAt: null }).lean(),
            Lodgment.find(ytdQuery).lean()
        ]);

        const baseCapital = startingCapital ? startingCapital.totalValue : 0;
        const totalPurchasesCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
        const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const totalCOGS = sales.reduce((sum, s) => sum + (s.totalCOGS || 0), 0);
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
        const netProfitOrLoss = totalSalesRevenue - totalCOGS - totalExpenses;

        const totalCreditGivenAllTime = allCredits.reduce((sum, c) => sum + (c.totalAmountOwed || 0), 0);
        const totalCollectedAllTime = allCollections.reduce((sum, c) => sum + (c.amountCollected || 0), 0);
        const outstandingCredit = totalCreditGivenAllTime - totalCollectedAllTime;

        // Context for Gemini
        const businessContext = {
            currentYear: targetYear,
            financialMetricsYTD: {
                startingCapital: baseCapital,
                totalPurchasesCost,
                totalSalesRevenue,
                totalCOGS,
                totalExpenses,
                netProfitOrLoss,
                outstandingCredit,
                totalLodgments: lodgments.reduce((sum, l) => sum + (l.amount || 0), 0)
            },
            recentActivity: {
                last5Sales: sales.slice(-5).map(s => ({ product: s.product, amount: s.totalAmount, date: s.submittedAt })),
                last5Expenses: expenses.slice(-5).map(e => ({ description: e.description, amount: e.amount, date: e.submittedAt }))
            }
        };

        const aiResponse = await generateBusinessInsight(prompt, businessContext);

        return NextResponse.json({ response: aiResponse });

    } catch (error: any) {
        console.error("AI Assistant API Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
