import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
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

        const [purchases, collections, lodgments] = await Promise.all([
            Purchase.find(query).sort({ submittedAt: -1 }),
            Collection.find(query).sort({ submittedAt: -1 }),
            Lodgment.find(query).sort({ submittedAt: -1 })
        ]);

        return NextResponse.json({ purchases, collections, lodgments });
    } catch (error) {
        console.error("Error fetching admin entries today:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
