import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, resolveEffectiveRole } from "@/lib/auth";
import { dbRepo } from "@/db/repo";
import { NO_STORE_HEADERS } from "@/lib/http";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const user = await dbRepo.getUserById(session.id);
    if (!user) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    const effectiveRole = resolveEffectiveRole(user.email, user.role);

    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: effectiveRole,
        },
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}
