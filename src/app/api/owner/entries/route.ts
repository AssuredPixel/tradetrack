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

import { rateLimit } from "@/lib/rate-limiter";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting for history browsing
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 60, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Too many history requests" }, { status: 429 });
        }

        const url = new URL(req.url);
        const typeFilter = url.searchParams.get("type") || "ALL";
        const userFilter = url.searchParams.get("user") || "ALL";
        const startDateStr = url.searchParams.get("start");
        const endDateStr = url.searchParams.get("end");
        const showDeleted = url.searchParams.get("showDeleted") === "true";

        // Pagination hardening - prevent OOM by clamping values
        const page = Math.min(Math.max(parseInt(url.searchParams.get("page") || "1"), 1), 1000);
        const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50"), 1), 100);
        
        // This is still a bit expensive but now capped at 100,000 items total (1000 * 100)
        const fetchAmount = page * limit; 

        await dbConnect();

        // Build the base query
        const baseQuery: any = showDeleted ? {} : { deletedAt: null };

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

        // Helper to format documents
        const formatDocs = (docs: any[], type: string) => {
            return docs.map(doc => ({
                id: doc._id.toString(),
                type: type,
                date: doc.date,
                submittedBy: doc.submittedBy,
                submittedAt: doc.submittedAt,
                amount: doc.totalAmount || doc.totalCost || doc.amount || doc.totalAmountOwed || doc.amountCollected,
                product: doc.product || null,
                quantity: doc.quantity || null,
                details: doc.customerName || doc.description || doc.supplierName || doc.bankName || null,
                notes: doc.notes || null,
                deletedAt: doc.deletedAt || null,
                rawDoc: doc
            }));
        };

        const activeTypes = typeFilter === "ALL"
            ? ["SALE", "CREDIT_SUPPLY", "EXPENSE", "PURCHASE", "COLLECTION", "LODGMENT"]
            : [typeFilter];

        // Fetch limited amount from each collection to merge sort
        const fetchPromises = [
            activeTypes.includes("SALE") ? Sale.find(baseQuery).sort({ date: -1, submittedAt: -1 }).limit(fetchAmount).lean() : Promise.resolve([]),
            activeTypes.includes("CREDIT_SUPPLY") ? CreditSupply.find(baseQuery).sort({ date: -1, submittedAt: -1 }).limit(fetchAmount).lean() : Promise.resolve([]),
            activeTypes.includes("EXPENSE") ? Expense.find(baseQuery).sort({ date: -1, submittedAt: -1 }).limit(fetchAmount).lean() : Promise.resolve([]),
            activeTypes.includes("PURCHASE") ? Purchase.find(baseQuery).sort({ date: -1, submittedAt: -1 }).limit(fetchAmount).lean() : Promise.resolve([]),
            activeTypes.includes("COLLECTION") ? Collection.find(baseQuery).sort({ date: -1, submittedAt: -1 }).limit(fetchAmount).lean() : Promise.resolve([]),
            activeTypes.includes("LODGMENT") ? Lodgment.find(baseQuery).sort({ date: -1, submittedAt: -1 }).limit(fetchAmount).lean() : Promise.resolve([]),
        ];

        const [sales, credits, expenses, purchases, collections, lodgments] = await Promise.all(fetchPromises);

        let mergedEntries: any[] = [
            ...formatDocs(sales as any[], "SALE"),
            ...formatDocs(credits as any[], "CREDIT_SUPPLY"),
            ...formatDocs(expenses as any[], "EXPENSE"),
            ...formatDocs(purchases as any[], "PURCHASE"),
            ...formatDocs(collections as any[], "COLLECTION"),
            ...formatDocs(lodgments as any[], "LODGMENT")
        ];

        // Global sort before slicing for pagination
        mergedEntries.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            if (dateA !== dateB) return dateB - dateA;
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        });

        const startIndex = (page - 1) * limit;
        const pagedEntries = mergedEntries.slice(startIndex, startIndex + limit);
        const hasMore = mergedEntries.length > startIndex + limit;

        // Extract unique users
        const uniqueUsers = Array.from(new Set(mergedEntries.map(e => e.submittedBy)));

        return NextResponse.json({
            entries: pagedEntries,
            users: uniqueUsers,
            hasMore
        });

    } catch (error) {
        console.error("Error fetching owner entries:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
