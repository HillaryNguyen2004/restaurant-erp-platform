// app/api/auth/logout/route.ts
import { deleteSession } from "@/lib/session";

export async function POST() {
    await deleteSession();
    return Response.json({ success: true });
}