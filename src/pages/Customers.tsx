import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Cake, 
  MapPin, 
  ChevronRight,
  MoreVertical,
  UserPlus,
  Users,
  Trash2,
  X,
  History,
  FileText,
  Clock,
  ExternalLink,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../services/dbService';
import { Customer, Collection, Order } from '../types';
import { formatDate, cn, formatPrice } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';
import { AddCustomerModal } from '../components/AddCustomerModal';
import { ORDER_STATUS_LABELS } from '../constants';

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const { searchTerm, setSearchTerm } = useSearch();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  useEffect(() => {
    return dbService.subscribeToList<Customer>(Collection.CUSTOMERS, (data) => {
      setCustomers(data);
      setLoading(false);
    });
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteCustomer = async (customerId: string) => {
    if (!window.confirm('Möchten Sie diesen Kunden wirklich unwiderruflich löschen? Alle zugehörigen Verknüpfungen (Bestell-History etc.) bleiben ggf. als Snapshots erhalten, aber der Kunde verschwindet aus der Liste.')) return;
    
    try {
      await dbService.deleteCustomer(customerId);
      toast.success('Kunde gelöscht');
      setActiveMenuId(null);
    } catch (error: any) {
      toast.error('Fehler beim Löschen: ' + error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-light italic text-slate-100 mb-1">Customer Sphere</h2>
          <p className="text-sm text-astro-muted">Datenbank aller registrierten Seelen im System.</p>
        </div>
        <button 
          onClick={() => {
            setEditingCustomer(null);
            setIsAddModalOpen(true);
          }}
          className="btn-gold flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Kunde hinzufügen
        </button>
      </div>

      <AddCustomerModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingCustomer(null);
        }} 
        customer={editingCustomer}
      />

      <CustomerDetailsModal
        customer={selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
      />

      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px] flex items-center gap-3 bg-black/40 border border-astro-line rounded-lg px-4 py-2.5 focus-within:border-astro-gold transition-all">
          <Search className="h-4 w-4 text-astro-muted" />
          <input 
            type="text" 
            placeholder="Suchen nach Name, Email..." 
            className="bg-transparent border-none outline-none text-xs w-full placeholder:text-astro-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
             <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-astro-gold"></div>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="col-span-full py-20 text-center text-astro-muted glass-panel italic">
            Keine Kunden in diesem Sektor gefunden.
          </div>
        ) : (
          filteredCustomers.map((customer, i) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel p-6 group relative"
            >
              <div className="flex items-start gap-4 mb-8">
                <div className="h-12 w-12 rounded bg-astro-gold/10 flex items-center justify-center text-astro-gold text-lg font-bold border border-astro-gold/20">
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-astro-gold transition-colors italic">
                    {customer.firstName} {customer.lastName}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-astro-muted mt-1 uppercase tracking-wider">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </div>
                </div>
                
                <div className="relative">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === customer.id ? null : customer.id);
                    }}
                    className="p-1 rounded hover:bg-white/10 text-astro-muted hover:text-astro-gold transition-all"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {activeMenuId === customer.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute right-0 mt-2 w-36 glass-panel z-20 py-1 border border-white/10"
                        >
                          <button 
                            onClick={() => {
                              setEditingCustomer(customer);
                              setIsAddModalOpen(true);
                              setActiveMenuId(null);
                            }}
                            className="w-full text-left px-4 py-2 text-[10px] uppercase font-bold text-astro-muted hover:text-astro-gold hover:bg-white/5 flex items-center gap-2"
                          >
                            <Edit2 className="h-3 w-3" />
                            Bearbeiten
                          </button>
                          <button 
                            onClick={() => handleDeleteCustomer(customer.id)}
                            className="w-full text-left px-4 py-2 text-[10px] uppercase font-bold text-red-400 hover:bg-red-400/10 flex items-center gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Löschen
                          </button>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="space-y-3 pb-6 border-b border-astro-line">
                {customer.phone && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <Phone className="h-3.5 w-3.5 text-astro-gold/50" />
                    {customer.phone}
                  </div>
                )}
                {customer.birthDate && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <Cake className="h-3.5 w-3.5 text-astro-gold/50" />
                    {formatDate(customer.birthDate)} {customer.birthTime && `(${customer.birthTime})`}
                    {customer.zodiacSign && (
                      <span className="text-astro-gold/70 text-[9px] uppercase tracking-tighter ml-1">
                        [{customer.zodiacSign}]
                      </span>
                    )}
                  </div>
                )}
                {customer.birthPlace && (
                  <div className="flex items-center gap-3 text-[11px] text-slate-400">
                    <MapPin className="h-3.5 w-3.5 text-astro-gold/50" />
                    {customer.birthPlace}
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button 
                  onClick={() => setSelectedCustomer(customer)}
                  className="text-astro-gold text-[10px] font-bold uppercase tracking-[0.15em] hover:underline flex items-center gap-1 group/link"
                >
                  Details & Historie
                  <ChevronRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function CustomerDetailsModal({ customer, onClose }: { customer: Customer | null, onClose: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setLoading(true);
      dbService.getOrdersByCustomer(customer.id).then(data => {
        setOrders(data || []);
        setLoading(false);
      });
    }
  }, [customer]);

  if (!customer) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl glass-panel p-0 overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="p-6 border-b border-astro-gold/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded bg-astro-gold/10 flex items-center justify-center text-astro-gold text-lg font-bold border border-astro-gold/20 shrink-0">
                {customer.firstName[0]}{customer.lastName[0]}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-100 italic">
                  {customer.firstName} {customer.lastName}
                </h3>
                <p className="text-[10px] text-astro-muted uppercase tracking-widest">Kundenakte: {customer.id.slice(0, 8)}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-astro-muted hover:text-white transition-all">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Profile Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="astro-card p-6 border-astro-gold/10">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-astro-gold mb-4 flex items-center gap-2">
                    <Users className="h-3 w-3" />
                    Profil
                  </h4>
                  <div className="space-y-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-astro-muted font-bold">Email</span>
                      <span className="text-xs text-slate-200">{customer.email}</span>
                    </div>
                    {customer.phone && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase text-astro-muted font-bold">Telefon</span>
                        <span className="text-xs text-slate-200">{customer.phone}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase text-astro-muted font-bold">Geburtstag</span>
                        <span className="text-xs text-slate-200">{formatDate(customer.birthDate)}</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] uppercase text-astro-muted font-bold">Zeit</span>
                        <span className="text-xs text-slate-200">{customer.birthTime || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-astro-muted font-bold">Ort</span>
                      <span className="text-xs text-slate-200">{customer.birthPlace || "N/A"}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase text-astro-muted font-bold">Sternzeichen</span>
                      <span className="text-xs text-astro-gold font-bold italic">{customer.zodiacSign || "Unbekannt"}</span>
                    </div>
                  </div>
                </div>

                <div className="astro-card p-6 border-astro-line/30 bg-white/5">
                   <h4 className="text-[10px] font-bold uppercase tracking-widest text-astro-muted mb-4 flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Interne Notizen
                  </h4>
                  <p className="text-xs text-astro-muted italic leading-relaxed">
                    {customer.notes || "Keine Notizen zu diesem Kontakt vorhanden."}
                  </p>
                </div>
              </div>

              {/* Order History */}
              <div className="lg:col-span-2 space-y-6">
                 <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-astro-muted flex items-center gap-2">
                      <History className="h-3 w-3" />
                      Bestell-Historie
                    </h4>
                    <span className="text-[10px] text-astro-gold bg-astro-gold/5 px-2 py-0.5 rounded border border-astro-gold/10">
                      {orders.length} Aufträge
                    </span>
                 </div>

                 {loading ? (
                    <div className="py-12 flex justify-center">
                       <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-astro-gold"></div>
                    </div>
                 ) : orders.length === 0 ? (
                    <div className="py-12 text-center glass-panel border-dashed border-astro-line">
                       <p className="text-xs text-astro-muted italic">Dieser Kunde hat noch keine Pfade im System gezeichnet.</p>
                    </div>
                 ) : (
                    <div className="space-y-3">
                      {orders.map(order => (
                        <div key={order.id} className="glass-panel p-4 flex items-center justify-between hover:border-astro-gold/30 transition-all group">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded flex items-center justify-center shrink-0",
                              order.status === 'delivered' ? "bg-green-400/10 text-green-400" : "bg-astro-gold/10 text-astro-gold"
                            )}>
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                               <h5 className="text-sm font-bold text-slate-100 group-hover:text-astro-gold transition-colors">{order.productName}</h5>
                               <div className="flex items-center gap-3 text-[10px] text-astro-muted mt-1 uppercase tracking-tighter">
                                 <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {formatDate(order.createdAt)}</span>
                                 <span>•</span>
                                 <span className={cn(
                                   "font-bold",
                                   order.status === 'delivered' ? "text-green-400" : "text-astro-gold"
                                 )}>{ORDER_STATUS_LABELS[order.status]}</span>
                               </div>
                            </div>
                          </div>
                          <div className="text-right">
                             <div className="text-sm font-bold text-slate-200">{formatPrice(order.price)}</div>
                             <div className="text-[8px] uppercase tracking-widest text-astro-muted mt-1">ID: ...{order.id.slice(-6)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                 )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-black/40 border-t border-astro-gold/10 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest text-astro-muted hover:text-white transition-all"
            >
              Schließen
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
