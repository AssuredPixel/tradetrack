import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import User from '../models/User.js';
import { Role } from '../lib/types.js';

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
    console.error('DATABASE_URL is not defined in .env');
    process.exit(1);
}

async function seed() {
    try {
        console.log('Connecting to MongoDB for seeding...');
        await mongoose.connect(MONGODB_URI!);
        console.log('Connected.');

        const usersToSeed = [
            {
                username: 'salesboy',
                password: 'SalesTrack2026',
                role: Role.SALESBOY,
            },
            {
                username: 'admin',
                password: 'AdminTrack2026',
                role: Role.ADMIN,
            },
            {
                username: 'owner',
                password: 'OwnerTrack2026',
                role: Role.OWNER,
            },
        ];

        for (const userData of usersToSeed) {
            const existingUser = await User.findOne({ username: userData.username });
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            if (existingUser) {
                console.log(`User ${userData.username} exists. Updating password and role...`);
                existingUser.password = hashedPassword;
                existingUser.role = userData.role;
                await existingUser.save();
                console.log(`User ${userData.username} updated.`);
            } else {
                console.log(`Creating user ${userData.username}...`);
                await User.create({
                    ...userData,
                    password: hashedPassword,
                });
                console.log(`User ${userData.username} created.`);
            }
        }

        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Error during seeding:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
    }
}

seed();
