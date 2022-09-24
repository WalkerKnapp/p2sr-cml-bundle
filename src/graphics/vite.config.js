import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import tsconfigPaths from 'vite-tsconfig-paths';
import { VitePluginFonts } from 'vite-plugin-fonts';
import { svelteSVG } from "rollup-plugin-svelte-svg";

export default defineConfig({
    build: {
        outDir: '../../graphics',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                overlay: "src/graphics/overlay.html",
                mapSelectBg: "src/graphics/map-select-bg.html",
                mapSelectOverlay: "src/graphics/map-select.html"
            }
        }
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
        svelteSVG({
            enforce: "pre"
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
    ],
    experimental: {
        renderBuiltUrl: (filename, type) => {
            console.log(filename, type);

            if (filename.endsWith(".wav")) {
                return `./${filename}`;
            }

            if (type.hostType === "html") {
                return `./${filename}`;
            } else {
                return `../${filename}`;
            }
        }
    }
})
