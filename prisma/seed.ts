import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

const users = [
  { name: "Bod", email: "bod@gmail.com", password: "DraftyBod123!" },
  { name: "Jane", email: "jane@gmail.com", password: "DraftyJane123!" },
];

async function main() {
  for (const user of users) {
    const existing = await prisma.user.findUnique({ where: { email: user.email } });
    if (existing) {
      console.log(`Skipped ${user.email}: account already exists; password was not changed.`);
      continue;
    }
    await auth.api.signUpEmail({ body: user });
    console.log(`Created ${user.email}.`);
  }
}

main().finally(() => prisma.$disconnect());
