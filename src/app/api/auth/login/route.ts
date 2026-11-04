import { NextResponse } from "next/server";
import { createSession, getAuthConfig, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const config = getAuthConfig();

    if (email !== config.email || password !== config.password) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(SESSION_COOKIE, await createSession(email), sessionCookieOptions);
    return response;
  } catch {
    return NextResponse.json({ error: "Authentication is not configured." }, { status: 500 });
  }
}
