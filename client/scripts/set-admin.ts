import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function setAdmin() {
  try {
    // Find users
    const users = await prisma.user.findMany();
    console.log("Found users:", users.map(u => ({ email: u.email, role: u.role })));

    if (users.length > 0) {
      // Update first user to ADMIN (or find by email)
      const user = users[0];
      await prisma.user.update({
        where: { id: user.id },
        data: { role: "ADMIN" }
      });
      console.log(`\n✅ Updated ${user.email} to ADMIN role`);
    } else {
      console.log("No users found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setAdmin();
