import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import StartingCapital from "@/models/StartingCapital";

// GET current year's starting capital
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
        const capital = await StartingCapital.findOne({ year: targetYear }).lean();

        return NextResponse.json({ capital });

    } catch (error) {
        console.error("Error fetching starting capital:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// Set Starting Capital
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            year,
            cashOnHand,
            flourBags, flourPricePerBag,
            sugarBags, sugarPricePerBag,
            oilRubbers, oilPricePerRubber,
            totalValue
        } = body;

        if (!year || cashOnHand === undefined) {
            return NextResponse.json({ error: "Missing required cash or year fields" }, { status: 400 });
        }

        await dbConnect();

        // Check if capital already exists and is locked
        const existing = await StartingCapital.findOne({ year });
        if (existing && existing.isLocked) {
            return NextResponse.json({ error: "Starting capital for this year is locked and cannot be edited directly." }, { status: 403 });
        }

        const capital = await StartingCapital.findOneAndUpdate(
            { year },
            {
                cashOnHand,
                flourBags, flourPricePerBag,
                sugarBags, sugarPricePerBag,
                oilRubbers, oilPricePerRubber,
                totalValue,
                setBy: (session.user as any).username || "System",
                isLocked: true // Lock immediately upon save
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, capital });

    } catch (error) {
        console.error("Error setting starting capital:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
