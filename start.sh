#!/bin/bash

skip_ollama=false

while [[ "$#" -gt 0 ]]; do
    case $1 in
        --skip-ollama) skip_ollama=true ;;
    esac
    shift
done

echo "🚀 Iniciando SneekerGuy App..."

# Start Ollama if not skipped and available
if [ "$skip_ollama" = false ]; then
    if command -v ollama &> /dev/null; then
        echo "📦 Iniciando Ollama..."
        ollama serve &
        sleep 2
        echo "✅ Ollama iniciado"
    else
        echo "⚠️  Ollama no instalado. Instalar desde: ollama.com"
    fi
else
    echo "⏭️  Ollama omitido"
fi

# Kill existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Start the app
npm run dev

echo "✅ Servidor corriendo en http://localhost:3000"