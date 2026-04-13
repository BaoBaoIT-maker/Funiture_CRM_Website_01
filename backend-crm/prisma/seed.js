import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { username: 'admin' },
        });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('123', 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                username: 'admin',
                password: hashedPassword,
            },
        });

        console.log('✅ Admin user created successfully:', admin);
        console.log('   Username: admin');
        console.log('   Password: 123');
    } catch (error) {
        console.error('❌ Seeder error:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

main();
