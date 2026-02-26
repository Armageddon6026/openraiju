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
