import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePluginFonts } from 'vite-plugin-fonts';

export default defineConfig({
    build: {
        outDir: '../../graphics',
        emptyOutDir: true
    },
    plugins: [
        tsconfigPaths(),
        VitePluginFonts({
            custom: {
                families: [
                    {
                        name: "D-DIN",
                        src: '../fonts/D-DIN.otf'
                    },
                    {
                        name: "D-DIN Bold",
                        src: '../fonts/D-DIN-Bold.otf'
                    },
                    {
                        name: "D-DIN Condensed Bold",
                        src: "../fonts/D-DINCondensed-Bold.otf"
                    }],
                preload: false
            }
        }),
        svelte({
            preprocess: [sveltePreprocess({
                typescript: {
                    compilerOptions: {
                        "baseUrl": ".",
                        "paths": {
                            "nodecg": ["../../../../types/browser"]
                        }
                    }
                }
            })]
        })
    ]
})
