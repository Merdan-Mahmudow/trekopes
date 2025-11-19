interface ImportMetaEnv {
    readonly VITE_DEBUG: boolean;
    readonly VITE_INITDATA: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}