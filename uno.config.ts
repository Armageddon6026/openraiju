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
		presetIcons(),
		presetWebFonts({
			provider: 'google',
		}),
	],
	transformers: [transformerDirectives(), transformerVariantGroup()],
})
