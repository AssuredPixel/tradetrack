import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./db";
import User from "@/models/User";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Incorrect username or password");
                }

                await dbConnect();

                const user = await User.findOne({ username: credentials.username });

                if (!user || user.deletedAt) {
                    throw new Error("Incorrect username or password");
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    throw new Error("Incorrect username or password");
                }

                return {
                    id: user._id.toString(),
                    username: user.username,
                    role: user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role;
                token.username = (user as any).username;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role;
                (session.user as any).username = token.username;
                (session.user as any).id = token.sub;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 hours
        updateAge: 60 * 60,    // Update the session every hour to maintain the 24h inactivity window
    },
    secret: process.env.NEXTAUTH_SECRET,
};
