import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";
import { getDateRangeFromParams } from "@/lib/date-utils";

interface Transaction {
    _id: string;
    date: Date;
    type: "SUPPLY" | "COLLECTION";
    amount: number;
    product?: string;
    quantity?: number;
    unitType?: string;
    notes?: string;
    submittedBy: string;
    submittedAt: Date;
}

interface CustomerLedger {
    customerName: string;
    totalSupplied: number;
    totalCollected: number;
    balance: number;
    transactions: Transaction[];
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const { start, end } = getDateRangeFromParams(url.searchParams);

        await dbConnect();

        // Let's get ALL credit supplies and collections to calculate true active balance
        const allSupplies = await CreditSupply.find({ deletedAt: null }).lean();
        const allCollections = await Collection.find({ deletedAt: null }).lean();

        const customerMap = new Map<string, CustomerLedger>();

        // Process all supplies
        allSupplies.forEach(supply => {
            const name = supply.customerName;
            if (!customerMap.has(name)) {
                customerMap.set(name, { customerName: name, totalSupplied: 0, totalCollected: 0, balance: 0, transactions: [] });
            }
            const data = customerMap.get(name)!;
            data.totalSupplied += supply.totalAmountOwed;
            data.balance += supply.totalAmountOwed;

            // Only add transaction to ledger history if it falls within the selected period
            if (supply.date >= start && supply.date <= end) {
                data.transactions.push({
                    _id: supply._id.toString(),
                    date: supply.date,
                    type: "SUPPLY",
                    amount: supply.totalAmountOwed,
                    product: supply.product,
                    quantity: supply.quantity,
                    unitType: supply.unitType,
                    notes: supply.notes,
                    submittedBy: supply.submittedBy,
                    submittedAt: supply.submittedAt
                });
            }
        });

        // Process all collections
        allCollections.forEach(collection => {
            const name = collection.customerName;
            if (!customerMap.has(name)) {
                customerMap.set(name, { customerName: name, totalSupplied: 0, totalCollected: 0, balance: 0, transactions: [] });
            }
            const data = customerMap.get(name)!;
            data.totalCollected += collection.amountCollected;
            data.balance -= collection.amountCollected; // reduce debt

            if (collection.date >= start && collection.date <= end) {
                data.transactions.push({
                    _id: collection._id.toString(),
                    date: collection.date,
                    type: "COLLECTION",
                    amount: collection.amountCollected,
                    notes: collection.notes,
                    submittedBy: collection.submittedBy,
                    submittedAt: collection.submittedAt
                });
            }
        });

        const activeCustomers: CustomerLedger[] = [];
        const clearedCustomers: CustomerLedger[] = [];

        for (const data of customerMap.values()) {
            // Sort transactions by date descending for the expanded view
            data.transactions.sort((a, b) => b.date.getTime() - a.date.getTime());

            // We consider an active customer one with a balance > 0,
            // OR if their balance is 0 but they had a transaction in this period
            if (data.balance > 0) {
                activeCustomers.push(data);
            } else if (data.balance <= 0) {
                clearedCustomers.push(data);
            }
        }

        activeCustomers.sort((a, b) => b.balance - a.balance);

        return NextResponse.json({
            period: { start, end },
            activeCustomers,
            clearedCustomers
        });

    } catch (error) {
        console.error("Error fetching credit ledger:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
