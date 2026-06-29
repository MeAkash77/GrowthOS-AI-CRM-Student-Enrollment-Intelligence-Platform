import { iframeErrorPropagation } from './vite-plugin-iframe-errors.ts';
import { loaderInjectPlugin } from './vite-plugin-loader.ts';
import { watermarkInjectPlugin } from './vite-plugin-watermark.ts';
import react from '@vitejs/plugin-react';
import path from 'path';
import { type UserConfigFn, loadEnv } from 'vite';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
const config: UserConfigFn = ({ mode }) => {
    process.env = {
        ...process.env,
        ...loadEnv(mode, process.cwd())
    };
    return {
        plugins: [
            react(),
            tailwindcss(),
            iframeErrorPropagation(),
            loaderInjectPlugin(),
            watermarkInjectPlugin({
                logo: process.env.VITE_BUILDER_PLATFORM_LOGO || '',
                url: process.env.VITE_BUILDER_PLATFORM_URL || '',
                theme: process.env.VITE_BUILDER_PLATFORM_BADGE_THEME || ''
            })
        ],
        server: {
            allowedHosts: process.env.ALLOWED_HOSTS?.split(',') || true,
            host: '0.0.0.0',
            port: parseInt(process.env.VITE_PORT!) || 5173,
            strictPort: false, // Allow Vite to pick next available port if 5173 is busy
            watch: {
                ignored: ['node_modules']
            },
            hmr: false
        },
        base: '/',
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src')
            }
        }
    };
};

export default config;
