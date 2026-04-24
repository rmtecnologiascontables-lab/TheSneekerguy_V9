# SneakerGuy App - Inventory Management

Sistema de gestión de inventario para Sneakers con IA.

##Configuración

1. **Clonar el repositorio**
2. **Instalar dependencias:**
   ```
   npm install
   ```

3. **Configurar variables de entorno:**
   Copiar `.env.example` a `.env` y completar las API keys:
   
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` - Email de servicio Google
   - `GOOGLE_PRIVATE_KEY` - Clave privada de Google Sheets
   - `GOOGLE_SHEET_ID` - ID de tu spreadsheet
   - `CLOUDINARY_*` - Credenciales Cloudinary (para imágenes)
   - `GROQ_API_KEY` - API key de Groq (https://console.groq.com)

4. **Iniciar:**
   ```
   npm run dev
   ```

## AI Models

- **Groq** (recomendado): `meta-llama/llama-4-scout-17b-16e-instruct` para OCR/imágenes
- **Ollama**: Modelos locales como `llama3.2:3b-instruct-q4_K_M`

## Deploy a Vercel

1. Subir a GitHub
2. Importar en https://vercel.com
3. Añadir Environment Variables en Vercel dashboard
4. Deploy automático

## Features

- 📸 OCR con IA (escanea etiquetas de productos)
- 🤖 Chat con IA (Asistente virtual)
- 📊 Dashboard con métricas
- 📦 Gestión de inventario en Google Sheets
- ☁️ Subida de imágenes a Cloudinary