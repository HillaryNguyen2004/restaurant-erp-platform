"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { createSession, deleteSession } from "@/lib/session";
import { MOCK_USERS } from "@/lib/mock-users";

type LoginState = { error?: string } | undefined;

export async function login(state: LoginState, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    // Find user
    const user = MOCK_USERS.find(u => u.email === email);
    if (!user) return { error: "Email or password is incorrect" };

    // Check password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return { error: "Email or password is incorrect" };

    // Create session and save cookie
    await createSession(user.id, user.role);

    // Redirect to the correct page based on role
    redirect(`/${user.role}`);
}

export async function logout() {
    await deleteSession();
    redirect("/auth/login");
}