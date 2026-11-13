import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export async function POST() {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get("authjs.session-token")?.value;

    if (sessionToken) {
      await db.session.deleteMany({
        where: { sessionToken },
      });
    }

    const response = NextResponse.json({
      success: true,
      message: "লগআউট সফল হয়েছে",
    });

    response.cookies.delete("authjs.session-token");
    return response;
  } catch (error) {
    console.error("Logout error:", error);
    const response = NextResponse.json({ success: true });
    response.cookies.delete("authjs.session-token");
    return response;
  }
}

