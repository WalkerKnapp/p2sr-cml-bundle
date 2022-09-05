import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';

export default defineConfig({
    base: "/",
    build: {
        outDir: '../../dashboard',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                ghostControl: "src/dashboard/ghost-control.html",
                mapControl: "src/dashboard/map-control.html"
            }
        }
    },
    plugins: [
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

            return `./${filename}`;
        }
    }
})
