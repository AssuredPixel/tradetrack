import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Purchase from "@/models/Purchase";
import Sale from "@/models/Sale";
import Expense from "@/models/Expense";
import CreditSupply from "@/models/CreditSupply";
import Collection from "@/models/Collection";
import Lodgment from "@/models/Lodgment";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "OWNER") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const encoder = new TextEncoder();
    let changeStreamActive = true;

    const readable = new ReadableStream({
        async start(controller) {
            // Helper function to push ping event to client
            const pushData = () => {
                if (!changeStreamActive) return;
                try {
                    controller.enqueue(encoder.encode(`data: {"type": "refresh"}\n\n`));
                } catch (e) {
                    console.error("Stream write error caught, likely client closed", e);
                }
            };

            // Attempt to aggressively connect change streams to all operational models
            // MongoDB Change Streams REQUIRE a replica set. 
            // In a local standalone MongoDB, watch() will immediately crash.
            // We use a try/catch to gently fallback if this happens, allowing standard polling.
            try {
                const streams = [
                    Purchase.watch(),
                    Sale.watch(),
                    Expense.watch(),
                    CreditSupply.watch(),
                    Collection.watch(),
                    Lodgment.watch()
                ];

                streams.forEach(stream => {
                    stream.on('change', () => {
                        console.log("Realtime: Database Change Detected. Instructing owner dashboard to fetch.");
                        pushData();
                    });

                    stream.on('error', (err) => {
                        console.log("Realtime: Change stream warning (likely local standalone env):", err.message);
                        // Do not crash the connection
                    });
                });

                // Cleanup instantly if the browser tab closes
                req.signal.onabort = () => {
                    changeStreamActive = false;
                    streams.forEach(stream => stream.close().catch(console.error));
                    controller.close();
                };

            } catch (error) {
                console.warn("Realtime: MongoDB Watch Failed to initialize. A replica set (MongoDB Atlas) is required for real-time pushing.", error);

                // Keep the connection open but idle if watch fails, preventing rapid fallback reconnects.
                // The frontend will function normally, but just manually refreshed.
                req.signal.onabort = () => {
                    changeStreamActive = false;
                    controller.close();
                };
            }
        }
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive"
        }
    });
}
