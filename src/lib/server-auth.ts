import { cookies } from "next/headers";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export async function getSession() {
  const cookieStore = await cookies();
  return verifySession(cookieStore.get(SESSION_COOKIE)?.value);
}
