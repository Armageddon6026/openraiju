import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
	plugins: [vue(), UnoCSS(), vueDevTools()],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url)),
		},
	},
	server: {
		open: true,
	},
	build: {
		minify: 'oxc',
		rolldownOptions: {
			output: {
				minify: true,
				entryFileNames: 'js/[name].[hash].js',
				chunkFileNames: 'js/[name].[hash].js',
				assetFileNames: (assetInfo) => {
					const name = assetInfo.name ?? ''
					let extType: string
					switch (true) {
						case !name:
							extType = 'assets'
							break
						case /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i.test(name):
							extType = 'media'
							break
						case /\.(png|jpe?g|gif|svg)$/i.test(name):
							extType = 'img'
							break
						case /\.css$/i.test(name):
							extType = 'css'
							break
						case /\.(woff2?|eot|ttf|otf)$/i.test(name):
							extType = 'fonts'
							break
						default:
							extType = 'assets'
					}
					return `${extType}/[name].[hash][extname]`
				},
			},
		},
	},
})
