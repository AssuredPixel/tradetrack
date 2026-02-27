import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
});

async function main() {
    console.log("Start seeding...");

    const users = [
        {
            username: "salesboy",
            role: "SALESBOY",
            password: "SalesTrack2026",
        },
        {
            username: "admin",
            role: "ADMIN",
            password: "AdminTrack2026",
        },
        {
            username: "owner",
            role: "OWNER",
            password: "OwnerTrack2026",
        },
    ];

    for (const user of users) {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        const upsertedUser = await prisma.user.upsert({
            where: { username: user.username },
            update: {
                password: hashedPassword,
                role: user.role,
            },
            create: {
                username: user.username,
                password: hashedPassword,
                role: user.role,
            },
        });

        console.log(`Created user ${upsertedUser.username} with role ${upsertedUser.role}`);
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error("Fatal error during seeding:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
