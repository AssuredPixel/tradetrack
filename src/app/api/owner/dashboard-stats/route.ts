import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { startOfYear, endOfYear } from "date-fns";
import StartingCapital from "@/models/StartingCapital";
import Purchase from "@/models/Purchase";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const yearParam = searchParams.get("year");
        const targetYear = yearParam ? parseInt(yearParam) : new Date().getFullYear();

        await dbConnect();

        // 1. Starting Capital
        const startingCapital = await StartingCapital.findOne({ year: targetYear }).lean();
        const baseCapital = startingCapital ? startingCapital.totalValue : 0;

        // Date Bounds for YTD
        const start = startOfYear(new Date(targetYear, 0, 1));
        const end = endOfYear(new Date(targetYear, 0, 1));
        const ytdQuery = { submittedAt: { $gte: start, $lte: end }, deletedAt: null };

        // Ensure we fetch EVERYTHING needed for accurate financial metrics
        const [purchases, sales, expenses, collectionsYTD, lodgmentsYTD, allCredits, allCollections] = await Promise.all([
            Purchase.find(ytdQuery).lean(),
            Sale.find(ytdQuery).lean(),
            Expense.find(ytdQuery).lean(),
            Collection.find(ytdQuery).lean(),
            Lodgment.find(ytdQuery).lean(),
            CreditSupply.find({ deletedAt: null }).lean(), // All-time for Outstanding Credit
            Collection.find({ deletedAt: null }).lean(),   // All-time for Outstanding Credit
        ]);

        // 2. Total Capital Deployed (Starting Capital + All Purchases)
        const totalPurchasesCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
        const totalCapitalDeployed = baseCapital + totalPurchasesCost;

        // 3. Total Sales Revenue
        const totalSalesRevenue = sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);

        // 4. True COGS: Sum of (costPricePerUnit × quantity) per individual sale.
        // This is calculated server-side from the costPricePerUnit that was snapshotted from
        // the most recent Purchase at the exact moment each sale was submitted.
        // The Salesboy never sees this — it's entirely automatic.
        const totalCOGS = sales.reduce((sum, s) => sum + (s.totalCOGS || 0), 0);

        // 5. Total Expenses
        const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);

        // 6. Net Profit/Loss (Revenue - Purchases/COGS - Expenses)
        const netProfitOrLoss = totalSalesRevenue - totalCOGS - totalExpenses;

        // 7. Outstanding Credit (All time)
        const totalCreditGivenAllTime = allCredits.reduce((sum, c) => sum + (c.totalAmountOwed || 0), 0);
        const totalCollectedAllTime = allCollections.reduce((sum, c) => sum + (c.amountCollected || 0), 0);
        const outstandingCredit = totalCreditGivenAllTime - totalCollectedAllTime;

        // 8. Total Credit Collected (YTD)
        const totalCreditCollectedYTD = collectionsYTD.reduce((sum, c) => sum + (c.amountCollected || 0), 0);

        // 9. Total Bank Lodgments (YTD)
        const totalBankLodgmentsYTD = lodgmentsYTD.reduce((sum, l) => sum + (l.amount || 0), 0);

        // --- ACTIVITY FEED (Top 10 Recent across all collections) ---
        // Fetch the absolute most recent 10 from each to ensure we don't miss any in the global top 10
        const recentQuery = { deletedAt: null };
        const sortQuery = { submittedAt: -1 as const };

        const [recentPurchases, recentSales, recentExpenses, recentCols, recentLods, recentCreds] = await Promise.all([
            Purchase.find(recentQuery).sort(sortQuery).limit(10).lean(),
            Sale.find(recentQuery).sort(sortQuery).limit(10).lean(),
            Expense.find(recentQuery).sort(sortQuery).limit(10).lean(),
            Collection.find(recentQuery).sort(sortQuery).limit(10).lean(),
            Lodgment.find(recentQuery).sort(sortQuery).limit(10).lean(),
            CreditSupply.find(recentQuery).sort(sortQuery).limit(10).lean(),
        ]);

        const mapActivity = (items: any[], type: string, amountField: string, descField?: string) => {
            return items.map(item => ({
                id: item._id.toString(),
                type,
                submittedBy: item.submittedBy,
                amount: item[amountField] || 0,
                description: descField ? item[descField] : undefined,
                submittedAt: item.submittedAt
            }));
        };

        const allActivity = [
            ...mapActivity(recentPurchases, "PURCHASE", "totalCost", "product"),
            ...mapActivity(recentSales, "SALE", "totalAmount", "product"),
            ...mapActivity(recentExpenses, "EXPENSE", "amount", "description"),
            ...mapActivity(recentCols, "COLLECTION", "amountCollected", "customerName"),
            ...mapActivity(recentLods, "LODGMENT", "amount"),
            ...mapActivity(recentCreds, "CREDIT SUPPLY", "totalAmountOwed", "customerName"),
        ];

        // Sort all aggregated recent items chronologically descending
        allActivity.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

        // Take exact top 10 globally
        const recentActivity = allActivity.slice(0, 10);

        return NextResponse.json({
            metrics: {
                startingCapital: baseCapital,
                totalCapitalDeployed,
                totalSalesRevenue,
                totalCOGS,
                totalExpenses,
                netProfitOrLoss,
                outstandingCredit,
                totalCreditCollectedYTD,
                totalBankLodgmentsYTD
            },
            recentActivity
        });

    } catch (error) {
        console.error("Error calculating dashboard stats:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
