import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  CalendarClock, 
  Package, 
  LogOut,
  Moon,
  Search,
  Bell,
  CheckCircle2,
  AlertCircle as AlertIcon,
  Info,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { cn } from '../lib/utils';
import { dbService } from '../services/dbService';
import { Collection } from '../types';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: ShoppingCart, label: 'Bestellungen', path: '/orders' },
  { icon: Users, label: 'Kunden', path: '/customers' },
  { icon: CalendarClock, label: 'Abonnements', path: '/subscriptions' },
  { icon: Package, label: 'Produkte', path: '/products' },
];

export function Layout() {
  const { logout, user } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const location = useLocation();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'success' | 'info' | 'warning';
    read: boolean;
  }[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleViewAllActivities = () => {
    setIsNotificationsOpen(false);
    // Future: navigate('/activity-log');
  };

  useEffect(() => {
    // Sound for notifications
    const playNotificationSound = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio play blocked by browser:', e));
    };

    // Monitor orders for upcoming deadlines
    const unsubscribe = dbService.subscribeToList<any>(Collection.ORDERS, (orders) => {
      const now = new Date();
      const warningThreshold = 12 * 60 * 60 * 1000; // 12 hours in ms
      
      const newNotifications: any[] = [];
      let playedSound = false;

      orders.forEach(order => {
        if (order.status !== 'delivered' && order.nextDeliveryDate) {
          const deliveryTime = new Date(order.nextDeliveryDate).getTime();
          const timeUntilDelivery = deliveryTime - now.getTime();

          if (timeUntilDelivery > 0 && timeUntilDelivery <= warningThreshold) {
            newNotifications.push({
              id: `deadline-${order.id}`,
              title: 'Lieferung fällig',
              message: `Bestellung #${order.id.slice(-4)} muss in weniger als 12h geliefert werden!`,
              time: 'JETZT',
              type: 'warning',
              read: false
            });
            
            // Avoid spamming sound if we already have these notifications
            const alreadyNotified = notifications.some(n => n.id === `deadline-${order.id}`);
            if (!alreadyNotified && !playedSound) {
              playNotificationSound();
              playedSound = true;
            }
          }
        }
      });

      if (newNotifications.length > 0) {
        setNotifications(prev => {
          // Merge and avoid duplicates
          const combined = [...newNotifications, ...prev.filter(p => !p.id.startsWith('deadline-'))];
          return combined.slice(0, 10);
        });
      }
    });

    return () => unsubscribe();
  }, [notifications.length]);

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="star-field"></div>
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-astro-line bg-black/40 backdrop-blur-md flex flex-col z-10">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full border border-astro-gold flex items-center justify-center">
              <span className="text-astro-gold text-xl">◈</span>
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                ASTRA <span className="text-astro-gold">NEXUS</span>
              </h1>
              <p className="text-[10px] text-astro-muted uppercase tracking-widest font-semibold">
                Console v1.0
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 p-3 rounded-r-md transition-all group",
                location.pathname === item.path
                  ? "sidebar-item-active"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn(
                "h-4 w-4",
                location.pathname === item.path ? "text-astro-gold" : "text-slate-400 group-hover:text-white"
              )} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-astro-line mt-auto">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-astro-gold/20 flex items-center justify-center text-xs text-astro-gold font-bold">
                {user?.displayName?.[0] || 'A'}
              </div>
              <div>
                <p className="text-xs font-semibold">Admin Modus</p>
                <p className="text-[10px] text-astro-muted">Manuelle Erfassung</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Abmelden
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden z-10 relative">
        {/* Header */}
        <header className="h-20 border-b border-astro-line bg-transparent flex items-center justify-between px-8">
          <div className="flex items-center gap-4 bg-black/40 border border-astro-line rounded-lg px-4 py-2 w-96">
            <Search className="h-4 w-4 text-astro-muted" />
            <input 
              type="text" 
              placeholder="Suchen..." 
              className="bg-transparent border-none outline-none text-xs w-full placeholder:text-astro-muted"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 relative" ref={notificationRef}>
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative text-astro-muted hover:text-white transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2 w-2 bg-astro-gold rounded-full border border-black shadow-[0_0_8px_rgba(212,175,55,0.5)]"></span>
              )}
            </button>

            <AnimatePresence>
              {isNotificationsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 glass-panel z-50 border border-astro-line overflow-hidden shadow-2xl"
                >
                  <div className="p-4 border-b border-astro-line flex justify-between items-center bg-white/5">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-astro-gold">Mitteilungen</h3>
                    <button 
                      onClick={markAllAsRead}
                      className="text-[10px] text-astro-muted hover:text-white transition-colors uppercase tracking-widest"
                    >
                      Alle gelesen
                    </button>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-astro-muted italic text-xs">
                        Keine neuen Mitteilungen
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id} 
                          className={cn(
                            "p-4 transition-colors hover:bg-white/5 cursor-pointer",
                            !notification.read && "bg-astro-gold/5"
                          )}
                        >
                          <div className="flex gap-3">
                            <div className="mt-0.5">
                              {notification.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                              {notification.type === 'info' && <Info className="h-4 w-4 text-blue-400" />}
                              {notification.type === 'warning' && <AlertIcon className="h-4 w-4 text-astro-gold" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="text-xs font-bold text-slate-100">{notification.title}</h4>
                                <span className="text-[9px] text-astro-muted">{notification.time}</span>
                              </div>
                              <p className="text-[11px] text-astro-muted leading-relaxed">
                                {notification.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-3 bg-white/5 border-t border-astro-line text-center">
                    <button 
                      onClick={handleViewAllActivities}
                      className="text-[10px] font-bold uppercase tracking-[0.2em] gold-gradient-text"
                    >
                      Alle Aktivitäten ansehen
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-3 pl-4 border-l border-astro-line">
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  className="h-8 w-8 rounded-full border border-astro-gold/30"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-astro-gold/20 border border-astro-gold/30 flex items-center justify-center text-astro-gold text-xs font-bold">
                  {user?.displayName?.[0] || 'A'}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
