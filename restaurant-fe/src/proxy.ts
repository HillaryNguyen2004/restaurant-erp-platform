// proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";

const publicRoutes = ["/", "/auth/login"];

export async function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const isPublic = publicRoutes.includes(pathname);

    const cookie = req.cookies.get("session")?.value;
    const session = await decrypt(cookie);
    const role = session?.role as string | undefined;

    if (!session && !isPublic) {
        return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    if (session && pathname === "/auth/login") {
        return NextResponse.redirect(new URL(`/${role}`, req.url));
    }

    if (role) {
        if (pathname.startsWith("/admin") && role !== "admin") return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
        if (pathname.startsWith("/staff") && role !== "staff") return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
        if (pathname.startsWith("/chef") && role !== "chef") return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
        if (pathname.startsWith("/customer") && role !== "customer") return NextResponse.redirect(new URL("/auth/unauthorized", req.url));
    }

    return NextResponse.next();
}

// config 
export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};