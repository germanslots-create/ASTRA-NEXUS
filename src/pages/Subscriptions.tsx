import { useState, useEffect } from 'react';
import { 
  CalendarClock, 
  RefreshCcw, 
  PauseCircle, 
  PlayCircle, 
  XCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { dbService } from '../services/dbService';
import { Subscription, Collection } from '../types';
import { formatDate, cn } from '../lib/utils';
import { toast } from 'react-hot-toast';

import { useSearch } from '../context/SearchContext';

export function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm } = useSearch();

  useEffect(() => {
    return dbService.subscribeToList<Subscription>(Collection.SUBSCRIPTIONS, (data) => {
      setSubscriptions(data);
      setLoading(false);
    });
  }, []);

  const filteredSubscriptions = subscriptions.filter(s => 
    s.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'paused': return 'text-astro-gold bg-astro-gold/10 border-astro-gold/20';
      case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-astro-muted bg-astro-muted/10 border-astro-muted/20';
    }
  };

  const handleToggleStatus = async (sub: Subscription) => {
    const newStatus = sub.status === 'active' ? 'paused' : 'active';
    try {
      await dbService.updateSubscription(sub.id, { status: newStatus as any });
      toast.success(`Abo wurde ${newStatus === 'active' ? 'reaktiviert' : 'pausiert'}`);
    } catch (err) {
      toast.error('Fehler beim Aktualisieren des Status.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold italic gold-gradient-text">Abonnements</h2>
        <p className="text-astro-muted">Überwachen und verwalten Sie alle aktiven Abo-Modelle.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 flex justify-center">
             <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-astro-gold"></div>
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="py-20 text-center text-astro-muted astro-card">
            Keine aktiven Abonnements gefunden.
          </div>
        ) : (
          filteredSubscriptions.map((sub) => (
            <div key={sub.id} className="astro-card p-6 flex flex-col lg:flex-row lg:items-center gap-6 group">
              <div className="flex items-center gap-4 flex-1">
                <div className="h-12 w-12 rounded-2xl bg-blue-400/10 flex items-center justify-center text-blue-400">
                  <RefreshCcw className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{sub.productName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                      getStatusColor(sub.status)
                    )}>
                      {sub.status === 'active' ? 'Aktiv' : sub.status === 'paused' ? 'Pausiert' : 'Gekündigt'}
                    </span>
                    <span className="text-xs text-astro-muted italic">Kunde ID: {sub.customerId.substring(0, 8)}...</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-astro-muted uppercase tracking-widest mb-1">Abrechnung & Laufzeit</span>
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-astro-gold" />
                    7 Tage Zyklus / {sub.cycleMonths} Monate
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-astro-muted uppercase tracking-widest mb-1">Nächste Lieferung</span>
                  <span className="text-sm font-medium text-blue-300">
                    {formatDate(sub.nextDeliveryDate)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleToggleStatus(sub)}
                  className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white transition-all group/btn"
                >
                  {sub.status === 'active' ? (
                    <PauseCircle className="h-5 w-5 text-astro-gold group-hover/btn:scale-110" />
                  ) : (
                    <PlayCircle className="h-5 w-5 text-green-400 group-hover/btn:scale-110" />
                  )}
                </button>
                <button className="p-3 rounded-xl bg-white/5 hover:bg-white/10 text-red-400 transition-all group/btn">
                  <XCircle className="h-5 w-5 group-hover/btn:scale-110" />
                </button>
                <button className="btn-gold flex items-center justify-center px-4 py-2.5 h-full">
                   Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
