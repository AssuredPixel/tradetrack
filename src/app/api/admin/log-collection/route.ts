import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Collection from "@/models/Collection";

import { z } from "zod";
import { rateLimit } from "@/lib/rate-limiter";

const collectionSchema = z.object({
    customerName: z.string().min(1),
    amountCollected: z.number().positive(),
    notes: z.string().optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Rate limiting for collections
        const ip = req.headers.get("x-forwarded-for") || "anonymous";
        const rl = rateLimit(ip, { limit: 10, windowMs: 60 * 1000 });
        if (!rl.success) {
            return NextResponse.json({ error: "Too many collection requests. Please wait a minute." }, { status: 429 });
        }

        const body = await req.json();
        const validation = collectionSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues.map(e => e.message) 
            }, { status: 400 });
        }

        const { customerName, amountCollected, notes, date } = validation.data;

        await dbConnect();

        const newCollection = new Collection({
            date: new Date(date),
            customerName,
            amountCollected,
            notes,
            submittedBy: (session.user as any).username,
        });

        await newCollection.save();

        return NextResponse.json({ message: "Collection logged successfully", collection: newCollection }, { status: 201 });
    } catch (error) {
        console.error("Error logging collection:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
