import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import "dotenv/config";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding...");

    const users = [
        {
            username: "salesboy",
            role: Role.SALESBOY,
            password: "SalesTrack2026",
        },
        {
            username: "admin",
            role: Role.ADMIN,
            password: "AdminTrack2026",
        },
        {
            username: "owner",
            role: Role.OWNER,
            password: "OwnerTrack2026",
        },
    ];

    for (const user of users) {
        try {
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
        } catch (err) {
            console.error(`Error processing user ${user.username}:`, err);
            throw err;
        }
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error("Fatal error during seeding:");
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
