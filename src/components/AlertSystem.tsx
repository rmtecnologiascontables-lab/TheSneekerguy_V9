import React, { useState, useMemo } from 'react';
import { Bell, AlertTriangle, DollarSign, MessageSquare, Package, Clock, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export type AlertType = 'low_stock' | 'new_sale' | 'message' | 'reminder' | 'general';

export interface Alert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  link?: string;
  productId?: string;
}

interface AlertBellProps {
  alerts?: Alert[];
}

export function AlertBell({ alerts = [] }: AlertBellProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  
  const unreadCount = useMemo(() => alerts.filter(a => !a.read).length, [alerts]);
  
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'low_stock': return <Package size={14} className="text-orange-500" />;
      case 'new_sale': return <DollarSign size={14} className="text-green-500" />;
      case 'message': return <MessageSquare size={14} className="text-blue-500" />;
      case 'reminder': return <Clock size={14} className="text-purple-500" />;
      default: return <AlertTriangle size={14} className="text-yellow-500" />;
    }
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-lg hover:bg-brand-bg transition-colors"
      >
        <Bell size={18} className="text-brand-ink" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div 
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-brand-surface border border-brand-border rounded-xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b border-brand-border flex items-center justify-between">
                <h3 className="text-xs font-black text-brand-ink uppercase tracking-widest">Notificaciones</h3>
                <button 
                  onClick={() => setShowDropdown(false)}
                  className="p-1 hover:bg-brand-bg rounded-lg transition-colors"
                >
                  <X size={14} className="text-brand-muted" />
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center text-brand-muted">
                    <Bell size={24} className="mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-bold">Sin notificaciones</p>
                    <p className="text-[10px] mt-1">Se detectarán alertas automáticamente</p>
                  </div>
                ) : (
                  alerts.slice(0, 10).map(alert => (
                    <button
                      key={alert.id}
                      onClick={() => setShowDropdown(false)}
                      className={cn(
                        "w-full p-3 text-left border-b border-brand-border/50 hover:bg-brand-bg transition-colors flex items-start gap-3",
                        !alert.read && "bg-brand-accent/5"
                      )}
                    >
                      <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-bold truncate", alert.read ? "text-brand-muted" : "text-brand-ink")}>
                          {alert.title}
                        </p>
                        <p className="text-[10px] text-brand-muted line-clamp-2">{alert.message}</p>
                        <p className="text-[9px] text-brand-muted mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.read && (
                        <div className="w-2 h-2 bg-brand-accent rounded-full shrink-0 mt-1" />
                      )}
                    </button>
                  ))
                )}
              </div>
              
              {alerts.length > 0 && (
                <div className="p-2 border-t border-brand-border">
                  <button className="w-full py-2 text-xs font-bold text-brand-accent hover:bg-brand-bg rounded-lg transition-colors flex items-center justify-center gap-1">
                    Ver todas las alertas <ChevronRight size={12} />
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default AlertBell;