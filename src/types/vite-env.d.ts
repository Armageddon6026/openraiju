/// <reference types="vite/client" />

interface ViteTypeOptions {
	strictImportMetaEnv: unknown
}

interface ImportMetaEnv {
	VITE_BASE_API_PATH: string
}

interface ImportMetaEnv {
	readonly env: ImportMetaEnv
}

declare const __APP_INFO__: {
	pkg: {
		name: string
		version: string
	}
	buildTimestamp: number
}
