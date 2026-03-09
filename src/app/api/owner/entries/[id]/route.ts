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
import AuditLog from "@/models/AuditLog";

// Helper to grab the model based on the type
const getModel = (type: string) => {
    switch (type) {
        case "SALE": return Sale;
        case "PURCHASE": return Purchase;
        case "EXPENSE": return Expense;
        case "CREDIT_SUPPLY": return CreditSupply;
        case "COLLECTION": return Collection;
        case "LODGMENT": return Lodgment;
        default: return null;
    }
};

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const body = await req.json();
        const { type, ...updates } = body;

        const Model = getModel(type);
        if (!Model) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

        await dbConnect();

        const record = await (Model as any).findById(id);
        if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        // Capture previous state for audit log
        const oldState = record.toObject();

        // Prevent editing immutable tracking fields
        delete updates.submittedBy;
        delete updates.submittedAt;
        delete updates._id;

        // Perform recalcs based on type if quantity or prices changed
        if (type === "SALE" && (updates.quantity || updates.sellingPricePerUnit)) {
            const qty = updates.quantity || record.quantity;
            const price = updates.sellingPricePerUnit || record.sellingPricePerUnit;
            const costPx = record.costPricePerUnit || 0;
            updates.totalAmount = qty * price;
            updates.totalCOGS = qty * costPx;
        }

        if (type === "PURCHASE" && (updates.quantity || updates.purchasePricePerUnit)) {
            const qty = updates.quantity || record.quantity;
            const price = updates.purchasePricePerUnit || record.purchasePricePerUnit;
            updates.totalCost = qty * price;
        }

        if (type === "CREDIT_SUPPLY" && (updates.quantity || updates.agreedPricePerUnit)) {
            const qty = updates.quantity || record.quantity;
            const price = updates.agreedPricePerUnit || record.agreedPricePerUnit;
            updates.totalAmountOwed = qty * price;
        }

        // Apply updates
        Object.assign(record, updates);
        record.editedAt = new Date();
        await record.save();

        // Build audit details summary
        const diffSummary = Object.keys(updates)
            .map(k => `${k}: ${oldState[k]} -> ${updates[k]}`)
            .join(' | ');

        await AuditLog.create({
            action: 'UPDATE',
            table: type,
            recordId: id,
            performedBy: session?.user?.name || "Owner",
            details: `Updated fields: ${diffSummary}`,
        });

        return NextResponse.json({ message: "Updated successfully", record });
    } catch (error) {
        console.error("Error updating entry:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const url = new URL(req.url);
        const type = url.searchParams.get("type");

        if (!type) {
            return NextResponse.json({ error: "Type is required" }, { status: 400 });
        }

        const Model = getModel(type);
        if (!Model) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

        await dbConnect();

        const record = await (Model as any).findById(id);
        if (!record) return NextResponse.json({ error: "Record not found" }, { status: 404 });

        record.deletedAt = new Date();
        await record.save();

        await AuditLog.create({
            action: 'DELETE',
            table: type,
            recordId: id,
            performedBy: session?.user?.name || "Owner",
            details: `Soft deleted record`,
        });

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting entry:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
