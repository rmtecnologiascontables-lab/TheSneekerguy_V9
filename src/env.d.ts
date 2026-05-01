interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY?: string;
  readonly VITE_OLLAMA_BASE_URL?: string;
  readonly VITE_OLLAMA_URL?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_API_KEY?: string;
  readonly VITE_CLOUDINARY_API_SECRET?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }

declare module '*.png' { const content: string; export default content; }
declare module '*.svg' { const content: string; export default content; }
declare module '*.jpg' { const content: string; export default content; }