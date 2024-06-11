import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueSetupExtend from 'vite-plugin-vue-setup-extend'
import legacy from '@vitejs/plugin-legacy'
import compressPlugin from 'vite-plugin-compression'
import * as path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import nodePolyfills from 'rollup-plugin-polyfill-node'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        {
            ...nodePolyfills({include: ['node_modules/**/*.js', /node_modules\/.vite\/.*js/]}),
            apply: 'serve'
        },
        vueSetupExtend(),
        legacy({
            targets: ['defaults', 'not IE 11'],
            additionalLegacyPolyfills: ['regenerator-runtime/runtime']
        }),
        compressPlugin({
            verbose: false,
            disable: false,
            threshold: 10240,
            algorithm: 'gzip',
            ext: '.gz',
        }),
        AutoImport({
            resolvers: [NaiveUiResolver()]
        }),
        Components({
            resolvers: [NaiveUiResolver()]
        })
    ],
    server: {
        port: 4000,
        open: true,
        cors: true,
        host: '0.0.0.0',
        strictPort: false,
        proxy: {
            '^/api': {
                target: 'https://factoryapi.cellula.life',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    },
    resolve: {
        alias: {
            src: path.resolve(__dirname, 'src'),
            store: path.resolve(__dirname, 'src/store'),
            comps: path.resolve(__dirname, 'src/components'),
            img: path.resolve(__dirname, 'src/assets/images')
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "src/style/element/index.scss" as *;`
            }
        }
    },
    build: {
        target: ['esnext'],
        minify: 'terser',
        sourcemap: false,
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    },
})
