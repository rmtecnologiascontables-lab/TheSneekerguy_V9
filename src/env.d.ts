interface ImportMetaEnv {
  readonly NEXT_PUBLIC_GROQ_API_KEY?: string;
  readonly NEXT_PUBLIC_OLLAMA_BASE_URL?: string;
}
interface ImportMeta { readonly env: ImportMetaEnv; }

declare module '*.png' { const content: string; export default content; }
declare module '*.svg' { const content: string; export default content; }
declare module '*.jpg' { const content: string; export default content; }