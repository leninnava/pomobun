/// <reference types="svelte" />
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SPEED_UP_TIMERS: string;
  readonly VITE_DISABLE_ANIMATIONS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}