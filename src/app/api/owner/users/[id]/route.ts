import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: userId } = await params;
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (!userId) {
            return NextResponse.json({ error: "User ID is required" }, { status: 400 });
        }

        await dbConnect();

        // Prevent admin from deleting themselves
        const currentUserId = (session.user as any).id;
        if (userId === currentUserId) {
            return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { deletedAt: new Date() },
            { new: true }
        );

        if (!updatedUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "User deactivated successfully" });
    } catch (error) {
        console.error("Error deactivating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
