/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base da API backend (ex: http://localhost:8080/api) */
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
