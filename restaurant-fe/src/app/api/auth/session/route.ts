// app/api/auth/session/route.ts
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    const session = await decrypt(cookieStore.get("session")?.value);
    if (!session) return Response.json({ user: null });
    return Response.json({ user: { id: session.userId, role: session.role } });
}