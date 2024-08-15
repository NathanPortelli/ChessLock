/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_EXTENSION_VERSION: string;
}

interface Importmeta {
	readonly env: ImportMetaEnv;
}
