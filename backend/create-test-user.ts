import { PrismaClient } from './src/generated/prisma/index.js';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const name = 'Test User';

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name,
        identities: {
          create: {
            provider: 'EmailPassword',
            providerId: email,
            metadata: {
              passwordHash: hashedPassword
            }
          }
        }
      }
    });

    console.log('Test user created/updated successfully:');
    console.log('Email:', email);
    console.log('Password:', password);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
