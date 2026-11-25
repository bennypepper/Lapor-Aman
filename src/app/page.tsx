import HomeClient, {
  type ClientSessionUser,
  type UserReportSummary,
} from "@/components/HomeClient";
import { getServerSession, resolveEffectiveRole } from "@/lib/auth";
import { dbRepo } from "@/db/repo";

export const dynamic = "force-dynamic";

export default async function Home() {
  let initialUser: ClientSessionUser | null = null;
  let initialReports: UserReportSummary[] = [];

  try {
    const session = await getServerSession();
    if (session) {
      const dbUser = await dbRepo.getUserById(session.id);
      if (dbUser) {
        initialUser = {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: resolveEffectiveRole(dbUser.email, dbUser.role),
        };

        const rows = await dbRepo.getReportsByUserId(dbUser.id);
        initialReports = rows.map((r) => ({
          id: r.id,
          ticketId: r.ticketId,
          websiteUrl: r.websiteUrl,
          category: r.category,
          details: r.details,
          status: r.status,
          createdAt:
            r.createdAt instanceof Date
              ? r.createdAt.toISOString()
              : String(r.createdAt),
        }));
      }
    }
  } catch (err) {
    console.error("Home RSC session hydration error:", err);
  }

  return <HomeClient initialUser={initialUser} initialReports={initialReports} />;
}
