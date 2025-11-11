/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
  readonly VITE_API_URL?: string;

  
  readonly VITE_ENV: string;               // 'development' | 'production'
  readonly VITE_API_BASE_URL: string;      // e.g. http://localhost:3001/api/v1
  readonly VITE_WS_URL: string;            // e.g. ws://localhost:3001
  readonly VITE_ENABLE_MOCKS?: string;     // "true" | "false"
  
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

