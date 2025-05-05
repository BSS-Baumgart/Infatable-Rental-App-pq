import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";
import type { AuthPayload } from "@/lib/jwt";

export function withAuth(
  handler: (req: NextRequest, context: any, user: AuthPayload) => any
) {
  return async (req: NextRequest, context: any) => {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      const user = verifyToken(token);
      return handler(req, context, user);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
  };
}
