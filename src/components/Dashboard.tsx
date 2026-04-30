import React, { useEffect, useRef } from 'react';
import { Product, DashboardStats, OrderStatus } from '../types';
import { formatCurrency, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Package, AlertTriangle, DollarSign, Activity } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  products: Product[];
  onNavigate: (tab: any) => void;
}

const COLORS = ['#000000', '#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export function Dashboard({ products, onNavigate }: DashboardProps) {
  const pieContainerRef = React.useRef<HTMLDivElement>(null);
  const barContainerRef = React.useRef<HTMLDivElement>(null);
  const [canRenderCharts, setCanRenderCharts] = React.useState(true);

  React.useEffect(() => {
    const checkDims = () => {
      if (pieContainerRef.current && barContainerRef.current) {
        const pieW = pieContainerRef.current.offsetWidth;
        const barW = barContainerRef.current.offsetWidth;
        setCanRenderCharts(pieW > 0 && barW > 0);
      }
    };
    checkDims();
    const t = setTimeout(checkDims, 300);
    const ro = new ResizeObserver(checkDims);
    if (pieContainerRef.current) ro.observe(pieContainerRef.current);
    if (barContainerRef.current) ro.observe(barContainerRef.current);
    return () => { ro.disconnect(); clearTimeout(t); };
  }, []);

  const stats: DashboardStats = React.useMemo(() => {
    const s: DashboardStats = {
      totalItems: products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0),
      lowStockItems: products.filter(p => (Number(p.quantity) || 0) <= (Number(p.minStock) || 1) && (Number(p.quantity) || 0) > 0).length,
      totalValueUsd: products.reduce((acc, p) => acc + ((Number(p.buyPriceUsd) || 0) * (Number(p.quantity) || 1)), 0),
      totalValueMxn: products.reduce((acc, p) => acc + ((Number(p.buyPriceMxn) || 0) * (Number(p.quantity) || 1)), 0),
      statusCounts: {
        COMPRADO: 0,
        EN_RUTA: 0,
        EN_BODEGA: 0,
        ENVIADO: 0,
        ENTREGADO: 0
      }
    };
    
    products.forEach(p => {
      const status = p.currentStatus as OrderStatus;
      if (s.statusCounts[status] !== undefined) {
        s.statusCounts[status] += (Number(p.quantity) || 1);
      }
    });
    
    return s;
  }, [products]);

  const statusLabelMap: Record<OrderStatus, string> = {
    COMPRADO: '📦 Comprado',
    EN_RUTA: '✈️ En Ruta',
    EN_BODEGA: '📍 En Zafi',
    ENVIADO: '🚚 Enviado MX',
    ENTREGADO: '✅ Entregado'
  };

  const statusData = Object.entries(stats.statusCounts).map(([name, value]) => ({ 
    name: statusLabelMap[name as OrderStatus], 
    value 
  }));
  const stockData = products
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 8)
    .map(p => ({ name: p.name.split(' ')[0], stock: p.quantity }));

  const hasStatusData = statusData.length > 0 && statusData.some(s => s.value > 0);
  const hasStockData = stockData.length > 0 && stockData.some(s => s.stock > 0);

  if (!hasStatusData && !hasStockData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-brand-muted">
        <Package size={48} className="mb-4 opacity-50" />
        <p className="text-sm font-medium">No hay productos en inventario</p>
        <p className="text-xs mt-1">Agrega productos para ver estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Total SKU" 
          value={stats.totalItems.toString()} 
          icon={<Package size={20} className="text-brand-ink" />}
          delay={0.1}
          onClick={() => onNavigate('all')}
        />
        <StatCard 
          title="Stock Bajo" 
          value={stats.lowStockItems.toString()} 
          icon={<AlertTriangle size={20} className="text-[#B45309]" />}
          color="text-[#B45309]"
          delay={0.2}
          onClick={() => onNavigate('stock')}
        />
        <StatCard 
          title="Valor Total" 
          value={formatCurrency(stats.totalValueUsd)} 
          icon={<DollarSign size={20} className="text-green-600" />}
          delay={0.3}
          subtitle={`≈ ${Math.round(stats.totalValueMxn).toLocaleString()} MXN`}
          onClick={() => onNavigate('finances')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <div ref={pieContainerRef} className="bg-brand-surface p-4 lg:p-8 rounded-xl border border-brand-border min-h-[350px] lg:h-[400px] flex flex-col transition-colors duration-300">
          <div className="flex justify-between items-center mb-4 lg:mb-8">
             <h3 className="font-bold text-xs lg:text-sm tracking-tight text-brand-ink">Distribución por Status</h3>
          </div>
          {(canRenderCharts && hasStatusData) ? (
            <div className="flex-1 w-full" style={{ minHeight: '280px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#1A1A1A' : COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-brand-muted text-sm">
              No hay productos en inventario
            </div>
          )}
        </div>

        <div ref={barContainerRef} className="bg-white p-4 lg:p-8 rounded-xl border border-brand-border min-h-[350px] lg:h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4 lg:mb-8">
             <h3 className="font-bold text-xs lg:text-sm tracking-tight text-brand-ink">Niveles de Inventario</h3>
          </div>
{(canRenderCharts && hasStockData) ? (
            <div className="flex-1 w-full" style={{ minHeight: '280px', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stockData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10" />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'var(--brand-muted)'}} />
                  <YAxis fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'var(--brand-muted)'}} />
                  <Tooltip cursor={{ fill: 'var(--brand-bg)' }} contentStyle={{ backgroundColor: 'var(--brand-surface)', borderColor: 'var(--brand-border)', color: 'var(--brand-ink)', fontSize: '10px' }} />
                  <Bar dataKey="stock" fill="var(--brand-ink)" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-brand-muted text-sm">
              No hay productos en inventario
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, color = "text-brand-ink", delay, icon, subtitle, onClick }: { title: string, value: string, color?: string, delay: number, icon?: React.ReactNode, subtitle?: string, onClick?: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -5,
        scale: 1.02,
        boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ delay }}
      onClick={onClick}
      className={cn(
        "bg-brand-surface p-6 rounded-2xl border border-brand-border transition-all duration-300 relative overflow-hidden cursor-pointer",
        "shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:shadow-inner"
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] lg:text-[12px] uppercase tracking-widest text-brand-label font-black">
          {title}
        </div>
        <div className="p-2 bg-brand-bg rounded-lg border border-brand-border/50">
          {icon}
        </div>
      </div>
      <div className={cn("text-24px lg:text-36px font-black tracking-tighter leading-none mb-1", color)}>
        {value}
      </div>
      {subtitle && (
        <div className="flex items-center gap-1.5">
          <div className="w-1 h-1 rounded-full bg-brand-accent animate-pulse" />
          <div className="text-[10px] font-bold text-brand-muted italic tracking-wide">
            {subtitle}
          </div>
        </div>
      )}
      
      {/* 3D Accent Line */}
      <div className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-brand-ink/5 to-transparent opacity-50" />
    </motion.div>
  );
}
