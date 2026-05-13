import { 
  Users, 
  ShoppingCart, 
  CalendarCheck, 
  AlertCircle, 
  TrendingUp, 
  ArrowUpRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { formatPrice } from '../lib/utils';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Collection, Order, Customer, Subscription } from '../types';

export function Dashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let count = 0;
    const checkLoading = () => {
      count++;
      if (count >= 3) setLoading(false);
    };

    const unsubOrders = dbService.subscribeToList<Order>(Collection.ORDERS, (data) => {
      setOrders(data);
      checkLoading();
    });
    const unsubCustomers = dbService.subscribeToList<Customer>(Collection.CUSTOMERS, (data) => {
      setCustomers(data);
      checkLoading();
    });
    const unsubSubs = dbService.subscribeToList<Subscription>(Collection.SUBSCRIPTIONS, (data) => {
      setSubscriptions(data);
      checkLoading();
    });

    return () => {
      unsubOrders();
      unsubCustomers();
      unsubSubs();
    };
  }, []);

  const openOrders = orders.filter(o => o.status === 'open').length;
  const activeSubs = subscriptions.filter(s => s.status === 'active').length;
  
  const stats = [
    { label: 'Offene Bestellungen', value: openOrders.toString(), icon: ShoppingCart, color: 'text-astro-gold', bg: 'bg-astro-gold/10' },
    { label: 'Aktive Abos', value: activeSubs.toString(), icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Kunden gesamt', value: customers.length.toString(), icon: Users, color: 'text-green-400', bg: 'bg-green-400/10' },
    { label: 'Überfällig', value: '0', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-light italic text-slate-100 mb-1">Astra Nexus</h2>
          <p className="text-sm text-astro-muted">Willkommen zurück. Hier ist die aktuelle Übersicht Ihrer astrologischen Aufträge.</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/orders?new=true')}
            className="btn-gold"
          >
            + Neue Bestellung erfassen
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-panel p-5"
          >
            <p className="text-[11px] text-astro-muted uppercase tracking-[0.1em] font-bold mb-3">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light">{stat.value}</span>
              <span className="text-[10px] text-astro-gold font-bold">aktuell</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 glass-panel overflow-hidden flex flex-col">
          <div className="p-5 border-b border-astro-line flex justify-between items-center bg-white/5">
            <h3 className="font-medium text-sm">Letzte Bestellungen (Manuelle Erfassung)</h3>
            <button 
              onClick={() => navigate('/orders')}
              className="text-astro-gold text-[10px] font-bold uppercase tracking-widest hover:underline"
            >
              Alle ansehen
            </button>
          </div>

          <div className="flex-1 overflow-auto divide-y divide-white/5 min-h-[300px]">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-20 text-astro-muted italic text-sm">
                Keine aktuellen Bestellungen vorhanden.
              </div>
            ) : (
              orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-transparent hover:bg-white/5 transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded bg-astro-gold/10 flex items-center justify-center text-astro-gold text-xs font-bold border border-astro-gold/20">
                      {order.customerSnapshot.firstName[0]}{order.customerSnapshot.lastName[0]}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-astro-gold transition-colors italic">
                        {order.customerSnapshot.firstName} {order.customerSnapshot.lastName}
                      </h4>
                      <p className="text-[10px] text-astro-muted">
                        {order.productName} • {order.customerSnapshot.birthDate || 'Kein Datum'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs text-astro-muted mb-1">Status</p>
                      <span className="status-badge bg-astro-gold/10 text-astro-gold border-astro-line">
                        {order.status === 'open' ? 'Offen' : order.status}
                      </span>
                    </div>
                    <div className="w-16 text-right font-medium text-sm">
                      {formatPrice(order.price)}
                    </div>
                    <button className="h-8 w-8 rounded flex items-center justify-center bg-white/5 hover:bg-astro-gold/20 text-astro-gold transition-colors">
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* New Customers */}
        <div className="glass-panel p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-widest text-astro-gold">
              <Users className="h-4 w-4" />
              Neu hinzugefügt
            </h3>
          </div>

          <div className="space-y-8 min-h-[200px]">
            {customers.length === 0 ? (
              <div className="text-astro-muted italic text-xs text-center p-10">
                Lade Kundenstamm...
              </div>
            ) : (
              customers.slice(0, 4).map((customer, i) => (
                <div key={customer.id} className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded border border-astro-line flex items-center justify-center bg-astro-gold/5 text-astro-gold text-xs font-bold">
                    {customer.firstName[0]}{customer.lastName[0]}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-slate-200">{customer.firstName} {customer.lastName}</h4>
                    <p className="text-[10px] text-astro-muted truncate max-w-[120px]">{customer.email}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-[10px] text-astro-muted mb-1">Kunde</p>
                     <p className="text-[10px] font-bold text-astro-gold uppercase italic">Aktiv</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button 
            onClick={() => navigate('/customers')}
            className="w-full mt-10 p-3 rounded-lg border border-astro-gold/30 gold-gradient-text text-xs font-bold uppercase tracking-[0.2em] hover:bg-astro-gold/5 transition-all"
          >
            Kundenstamm öffnen
          </button>
        </div>
      </div>
    </div>
  );
}

// Inline helper because I forgot it in create_file
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
