import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Page {
  id: string;
  name: string;
  route: string;
  category: string;
  keywords: string[];
}

const PAGES: Page[] = [
  { id: 'dashboard', name: 'Dashboard', route: 'dashboard', category: 'Principal', keywords: ['inicio', 'panel', 'stats', 'estadísticas'] },
  { id: 'all', name: 'Inventario General', route: 'all', category: 'Inventario', keywords: ['productos', 'stock', 'zapatillas', 'tenis', 'calzado'] },
  { id: 'pending', name: 'Pedidos Pendientes', route: 'pending', category: 'Pedidos', keywords: ['pendientes', 'por arrives', 'envío'] },
  { id: 'delivered', name: 'Pedidos Entregados', route: 'delivered', category: 'Pedidos', keywords: ['entregados', 'completados'] },
  { id: 'stock', name: 'Control de Stock', route: 'stock', category: 'Inventario', keywords: ['stock', 'inventario', 'existencias'] },
  { id: 'orders', name: 'Órdenes de Clientes', route: 'orders', category: 'Pedidos', keywords: ['órdenes', 'clientes', 'compras'] },
  { id: 'finances', name: 'Finanzas', route: 'finances', category: 'Finanzas', keywords: ['dinero', 'ganancias', 'ventas', ' financials'] },
  { id: 'catalog', name: 'Catálogo', route: 'catalog', category: 'Catálogo', keywords: ['catálogo', 'productos', 'tienda'] },
  { id: 'advisor', name: 'Asesor de Inversión', route: 'advisor', category: 'IA', keywords: ['ia', 'inteligencia', 'inversión', 'analizar'] },
  { id: 'settings', name: 'Configuración', route: 'settings', category: 'Sistema', keywords: ['ajustes', 'config', 'moneda', 'settings'] },
];

interface Suggestion {
  page: Page;
  matchType: 'name' | 'keyword';
}

const BRANDS = [
  { name: 'Nike', keywords: ['nike', 'air jordan', 'dunk', 'force 1', 'air max'] },
  { name: 'Adidas', keywords: ['adidas', 'yeezy', 'samba', 'ultraboost'] },
  { name: 'Jordan', keywords: ['jordan', 'aj1', 'retro'] },
  { name: 'New Balance', keywords: ['new balance', 'nb', '550', '2002r'] },
  { name: 'Puma', keywords: ['puma', 'suede', '_rs-x'] },
  { name: 'Converse', keywords: ['converse', 'chuck taylor', 'all star'] },
];

interface BuscadorSneakerProps {
  onNavigate: (tab: string) => void;
}

export function BuscadorSneaker({ onNavigate }: BuscadorSneakerProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const results: Suggestion[] = [];

    PAGES.forEach(page => {
      if (page.name.toLowerCase().includes(q) || page.keywords.some(k => k.includes(q))) {
        results.push({ page, matchType: 'name' });
      }
    });

    BRANDS.forEach(brand => {
      if (brand.name.toLowerCase().includes(q) || brand.keywords.some(k => k.includes(q))) {
        results.push({
          page: {
            id: 'search-brand',
            name: brand.name,
            route: 'search',
            category: 'Marca',
            keywords: brand.keywords
          },
          matchType: 'keyword'
        });
      }
    });

    setSuggestions(results.slice(0, 8));
    setShowSuggestions(results.length > 0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && suggestions[selectedIndex]) {
        handleSelect(suggestions[selectedIndex].page);
      } else if (query.trim()) {
        handleExternalSearch(query);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (page: Page) => {
    if (page.id === 'search-brand') {
      onNavigate('all');
    } else {
      onNavigate(page.route);
    }
    setQuery('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const handleExternalSearch = (text: string) => {
    const url = `https://www.google.com/search?q=${encodeURIComponent(text + ' sneakers')}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setQuery('');
    setShowSuggestions(false);
  };

  return (
    <div className="flex-1 bg-[#0D0D0D] p-6 overflow-auto">
      <div className="max-w-2xl mx-auto">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="text-[#4285F4]">
              <path d="M8 32C8 32 12 12 24 12C36 12 40 32 40 32" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
              <path d="M14 32L14 22L24 22L24 32M34 32L34 22L44 22L44 32" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              <ellipse cx="24" cy="36" rx="10" ry="3" fill="currentColor" opacity="0.4"/>
            </svg>
            <h1 className="text-3xl font-black tracking-wider" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              <span className="text-[#4285F4]">TH</span>
              <span className="text-[#EA4335]">E</span>
              <span className="text-[#FBBC05]"> </span>
              <span className="text-[#34A853]">SN</span>
              <span className="text-[#EA4335]">EE</span>
              <span className="text-[#46BDC6]">KE</span>
              <span className="text-[#4285F4]">R</span>
              <span className="text-[#FBBC05]"> </span>
              <span className="text-[#34A853]">G</span>
              <span className="text-[#EA4335]">U</span>
              <span className="text-[#FF6D01]">Y</span>
            </h1>
          </div>
          <p className="text-gray-500 text-sm">Tu asistente de navegación Sneaker</p>
        </motion.div>

        {/* Search Bar */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "bg-[#1a1a1a] rounded-full border-2 flex items-center px-5 py-3 transition-all",
              showSuggestions && suggestions.length > 0 ? "border-[#4285F4] rounded-b-3xl" : "border-transparent"
            )}
          >
            <Search size={22} className="text-gray-400 shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => query && setSuggestions(suggestions)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Buscar sneakers, marcas, categorías o navegar..."
              className="flex-1 bg-transparent text-white placeholder:text-gray-500 outline-none text-lg"
              autoComplete="off"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            )}
          </motion.div>

          {/* Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 bg-[#1a1a1a] border border-[#4285F4]/30 rounded-3xl rounded-t-none overflow-hidden z-50 shadow-2xl"
              >
                {suggestions.map((suggestion, idx) => (
                  <li
                    key={`${suggestion.page.id}-${idx}`}
                    className={cn(
                      "flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors",
                      idx === selectedIndex ? "bg-[#4285F4]/20" : "hover:bg-white/5"
                    )}
                    onClick={() => handleSelect(suggestion.page)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                  >
                    <Search size={16} className="text-gray-500" />
                    <div className="flex-1">
                      <span className="text-white font-medium">{suggestion.page.name}</span>
                      <span className="text-gray-500 text-sm ml-2">en {suggestion.page.category}</span>
                    </div>
                    <ArrowRight size={16} className="text-gray-500" />
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Quick Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-wrap justify-center gap-2"
        >
          {PAGES.slice(0, 5).map(page => (
            <button
              key={page.id}
              onClick={() => handleSelect(page)}
              className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-gray-400 hover:text-white rounded-full text-sm transition-colors"
            >
              {page.name}
            </button>
          ))}
        </motion.div>

        {/* AI Hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex items-center justify-center gap-2 text-gray-600 text-sm"
        >
          <Sparkles size={14} className="text-[#4285F4]" />
          <span>Escribe para buscar o navegar</span>
        </motion.div>
      </div>
    </div>
  );
}