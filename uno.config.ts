import fs from 'node:fs/promises'
import {
	defineConfig,
	presetWind4,
	presetIcons,
	presetWebFonts,
	presetAttributify,
	transformerDirectives,
	transformerVariantGroup,
} from 'unocss'

export default defineConfig({
	presets: [
		presetWind4(),
		presetAttributify(),
		presetIcons({
			collections: {
				brands: {
					razer: async () => {
						return await fetch(`https://assets2.razerzone.com/images/phoenix/razer-ths-logo.svg`).then((res) =>
							res.text(),
						)
					},
				},
				commons: {
					ophiophagus: () => fs.readFile('./src/assets/icons/ophiophagus.svg', 'utf-8'),
					github: async () => {
						return await fetch(`https://api.iconify.design/grommet-icons:github.svg`).then((res) => res.text())
					},
				},
			},
		}),
		presetWebFonts({
			provider: 'google',
		}),
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
})
