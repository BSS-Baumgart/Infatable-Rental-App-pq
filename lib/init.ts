import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UserRole } from "@/lib/types";

let initialized = false;

export async function initApp() {
  if (initialized) return;
  initialized = true;

  const userExists = await prisma.user.findFirst();
  if (!userExists) {
    const passwordHash = await bcrypt.hash("admin123", 10);
    const adminRole: UserRole = "admin";

    await prisma.user.create({
      data: {
        email: "admin@bouncyrent.com",
        name: "Administrator",
        role: adminRole,
        passwordHash,
      },
    });

    console.log("Admin user created");
  }
}
