import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // withAuth handles the redirect to /login if token is missing
        if (!token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        const role = token.role as string;

        // SALESBOY Access Control
        if (role === "SALESBOY") {
            if (path.startsWith("/admin") || path.startsWith("/owner")) {
                return NextResponse.redirect(new URL("/salesboy/dashboard", req.url));
            }
        }

        // ADMIN Access Control
        if (role === "ADMIN") {
            if (path.startsWith("/salesboy") || path.startsWith("/owner")) {
                return NextResponse.redirect(new URL("/admin/dashboard", req.url));
            }
        }

        // OWNER Access Control
        if (role === "OWNER") {
            if (path.startsWith("/salesboy") || path.startsWith("/admin")) {
                return NextResponse.redirect(new URL("/owner/dashboard", req.url));
            }
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
        pages: {
            signIn: "/login",
        },
    }
);

export const config = {
    matcher: [
        "/salesboy/:path*",
        "/admin/:path*",
        "/owner/:path*",
    ],
};
