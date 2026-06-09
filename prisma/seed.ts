import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  // Using scrypt for secure password hashing (no bcrypt dependency needed)
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
}

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL ?? "admin@alexandrastefana.studio";
  const password =
    process.env.ADMIN_SEED_PASSWORD ?? "change-this-password-immediately";

  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    await prisma.adminUser.create({
      data: {
        name: "Admin",
        email,
        password: await hashPassword(password),
      },
    });
    console.log(`Created admin user: ${email}`);
  } else {
    console.log(`Admin user already exists: ${email}`);
  }

  // Seed sample hero slides (placeholder URLs — replace with real S3 URLs)
  const slideCount = await prisma.heroSlide.count();
  if (slideCount === 0) {
    await prisma.heroSlide.createMany({
      data: [
        { image: "/assets/images/hero-placeholder-1.webp", sortOrder: 1, active: true },
        { image: "/assets/images/hero-placeholder-2.webp", sortOrder: 2, active: true },
      ],
    });
    console.log("Created placeholder hero slides");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
