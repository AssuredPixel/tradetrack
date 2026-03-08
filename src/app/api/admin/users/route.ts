import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcrypt";
import { Role } from "@/lib/types";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        // Fetch all active users, excluding passwords
        const users = await User.find({ deletedAt: null })
            .select("-password")
            .sort({ submittedAt: -1 });

        return NextResponse.json({ users });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { username, password, role } = body;

        if (!username || !password || !role) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!Object.values(Role).includes(role)) {
            return NextResponse.json({ error: "Invalid role" }, { status: 400 });
        }

        await dbConnect();

        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return NextResponse.json({ error: "Username already exists" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            password: hashedPassword,
            role,
        });

        await newUser.save();

        return NextResponse.json({ message: "User created successfully", user: { username: newUser.username, role: newUser.role } }, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
