import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lodgment from "@/models/Lodgment";
import { getDateRangeFromParams } from "@/lib/date-utils";

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(req.url);
        const { start, end } = getDateRangeFromParams(url.searchParams);

        await dbConnect();

        const query = {
            date: { $gte: start, $lte: end },
            deletedAt: null
        };

        const lodgments = await Lodgment.find(query).sort({ date: -1, submittedAt: -1 }).lean();

        let totalLodged = 0;

        lodgments.forEach(lodgment => {
            totalLodged += lodgment.amount;
        });

        return NextResponse.json({
            period: { start, end },
            totalLodged,
            entries: lodgments
        });

    } catch (error) {
        console.error("Error fetching bank lodgments report:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
