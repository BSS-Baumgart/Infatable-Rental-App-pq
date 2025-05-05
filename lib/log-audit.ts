import { prisma } from "@/lib/prisma";
import type { AuthPayload } from "@/lib/jwt";

export async function logAudit({
  user,
  action,
  target,
  details,
  ip,
}: {
  user?: AuthPayload;
  action: string;
  target?: string;
  details?: string;
  ip?: string | null;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: user?.id ?? null,
        action,
        target,
        details,
        ip: ip ?? undefined,
      },
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
  }
}
