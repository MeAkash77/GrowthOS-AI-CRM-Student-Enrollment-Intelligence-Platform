import app from './app.ts';
import prisma from './client.ts';
import { serve } from '@hono/node-server';
import dotenv from 'dotenv';

let server: any;

dotenv.config();

console.log("Starting server...");

console.log("LLM_PROVIDER:", process.env.LLM_PROVIDER);
console.log("LLM_MODEL:", process.env.LLM_MODEL);
console.log("UPTIQ_API_BASE_URL:", process.env.UPTIQ_API_BASE_URL);

console.log('Starting');
async function main() {
    try {
        await prisma.$connect();
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:");
        console.error(error);
        process.exit(1);
    }

    server = serve({
        fetch: app.fetch,
        port: parseInt(process.env.PORT || "3000", 10),
        hostname: "0.0.0.0"
    });

    const exitHandler = () => {
        if (server) {
            server.close(() => {
                process.exit(1);
            });
        } else {
            process.exit(1);
        }
    };

    const unexpectedErrorHandler = (error: any) => {
        console.error("UNEXPECTED SERVER ERROR:");
        console.error(error);
        exitHandler();
    };

    process.on('uncaughtException', unexpectedErrorHandler);
    process.on('unhandledRejection', unexpectedErrorHandler);

    process.on('SIGTERM', () => {
        if (server) {
            server.close();
        }
    });
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
main();
