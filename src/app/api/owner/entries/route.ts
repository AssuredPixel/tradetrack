import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Sale from "@/models/Sale";
import Purchase from "@/models/Purchase";
import Expense from "@/models/Expense";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";
import { endOfDay, startOfDay } from "date-fns";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const typeFilter = url.searchParams.get("type") || "ALL";
        const userFilter = url.searchParams.get("user") || "ALL";
        const startDateStr = url.searchParams.get("start");
        const endDateStr = url.searchParams.get("end");

        await dbConnect();

        // Build the base query
        const baseQuery: any = { deletedAt: null };

        if (startDateStr && endDateStr) {
            baseQuery.date = {
                $gte: startOfDay(new Date(startDateStr)),
                $lte: endOfDay(new Date(endDateStr))
            };
        } else if (startDateStr) {
            baseQuery.date = { $gte: startOfDay(new Date(startDateStr)) };
        } else if (endDateStr) {
            baseQuery.date = { $lte: endOfDay(new Date(endDateStr)) };
        }

        if (userFilter !== "ALL") {
            baseQuery.submittedBy = userFilter;
        }

        let allEntries: any[] = [];

        // Helper to format documents
        const formatDocs = (docs: any[], type: string) => {
            return docs.map(doc => ({
                id: doc._id.toString(),
                type: type,
                date: doc.date,
                submittedBy: doc.submittedBy,
                submittedAt: doc.submittedAt,
                // Map specific fields to a generic format for the table
                amount: doc.totalAmount || doc.totalCost || doc.amount || doc.totalAmountOwed || doc.amountCollected,
                product: doc.product || null,
                quantity: doc.quantity || null,
                details: doc.customerName || doc.description || doc.supplierName || doc.bankName || null,
                notes: doc.notes || null,
                rawDoc: doc // Keep original for debugging or specific details
            }));
        };

        // Fetch based on type filter
        if (typeFilter === "ALL" || typeFilter === "SALE") {
            const sales = await Sale.find(baseQuery).lean();
            allEntries = [...allEntries, ...formatDocs(sales, "SALE")];
        }

        if (typeFilter === "ALL" || typeFilter === "CREDIT_SUPPLY") {
            const credits = await CreditSupply.find(baseQuery).lean();
            allEntries = [...allEntries, ...formatDocs(credits, "CREDIT_SUPPLY")];
        }

        if (typeFilter === "ALL" || typeFilter === "EXPENSE") {
            const expenses = await Expense.find(baseQuery).lean();
            allEntries = [...allEntries, ...formatDocs(expenses, "EXPENSE")];
        }

        if (typeFilter === "ALL" || typeFilter === "PURCHASE") {
            const purchases = await Purchase.find(baseQuery).lean();
            allEntries = [...allEntries, ...formatDocs(purchases, "PURCHASE")];
        }

        if (typeFilter === "ALL" || typeFilter === "COLLECTION") {
            const collections = await Collection.find(baseQuery).lean();
            allEntries = [...allEntries, ...formatDocs(collections, "COLLECTION")];
        }

        if (typeFilter === "ALL" || typeFilter === "LODGMENT") {
            const lodgments = await Lodgment.find(baseQuery).lean();
            allEntries = [...allEntries, ...formatDocs(lodgments, "LODGMENT")];
        }

        // Sort globally by date descending
        allEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Extract unique users for the filter dropdown
        const uniqueUsers = Array.from(new Set(allEntries.map(e => e.submittedBy)));

        return NextResponse.json({
            entries: allEntries,
            users: uniqueUsers
        });

    } catch (error) {
        console.error("Error fetching owner entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
