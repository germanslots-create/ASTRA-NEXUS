import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ChevronRight,
  MoreVertical,
  X,
  Truck,
  Check,
  CheckCircle,
  Download,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { dbService } from '../services/dbService';
import { Order, Customer, Product, Collection } from '../types';
import { CATALOG, ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '../constants';
import { formatPrice, formatDate, cn, getZodiacSign, cleanObject } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';
import { addHours } from 'date-fns';

export function Orders() {
  const location = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleToggleDelivery = async (orderId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'delivered' ? 'open' : 'delivered';
      await dbService.updateOrder(orderId, { 
        status: newStatus as any,
        deliveryDate: newStatus === 'delivered' ? new Date().toISOString() : undefined 
      });
      toast.success(newStatus === 'delivered' ? 'Als geliefert markiert' : 'Status zurückgesetzt');
    } catch (error: any) {
      toast.error('Fehler: ' + error.message);
    }
  };

  const { searchTerm, setSearchTerm } = useSearch();

  const handleExportCSV = () => {
    if (orders.length === 0) {
      toast.error('Keine Daten zum Exportieren vorhanden.');
      return;
    }

    const headers = [
      'Bestell-ID',
      'Datum',
      'Vorname',
      'Nachname',
      'Email',
      'Telefon',
      'Geburtsdatum',
      'Produkt',
      'Typ',
      'Preis',
      'Status',
      'Zahlungsstatus',
      'Nächste Lieferung'
    ];

    const csvRows = orders.map(order => [
      order.id,
      formatDate(order.createdAt),
      `"${order.customerSnapshot.firstName}"`,
      `"${order.customerSnapshot.lastName}"`,
      order.customerSnapshot.email,
      `"${order.customerSnapshot.phone || ''}"`,
      order.customerSnapshot.birthDate || '',
      `"${order.productName}"`,
      order.productType === 'subscription' ? 'Abonnement' : 'Einmalig',
      order.price,
      ORDER_STATUS_LABELS[order.status],
      PAYMENT_STATUS_LABELS[order.paymentStatus],
      order.nextDeliveryDate ? formatDate(order.nextDeliveryDate) : ''
    ]);

    const csvContent = [
      headers.join(';'),
      ...csvRows.map(row => row.join(';'))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `AstroCRM_Bestellungen_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('CSV Export gestartet');
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm('Möchten Sie diese Bestellung wirklich unwiderruflich löschen?')) return;
    
    try {
      await dbService.deleteOrder(orderId);
      toast.success('Bestellung gelöscht');
    } catch (error: any) {
      toast.error('Fehler beim Löschen: ' + error.message);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('new') === 'true') {
      setIsFormOpen(true);
    }

    return dbService.subscribeToList<Order>(Collection.ORDERS, (data) => {
      setOrders(data);
      setLoading(false);
    });
  }, [location.search]);

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerSnapshot.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.customerSnapshot.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold italic gold-gradient-text">Bestellungen</h2>
          <p className="text-astro-muted">Verwalten Sie alle manuellen und importierten Aufträge.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="btn-gold flex items-center gap-2 w-fit"
        >
          <Plus className="h-5 w-5" />
          Neue Bestellung
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 items-center relative">
        <div className="flex-1 min-w-[300px] flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 focus-within:border-astro-gold/50 transition-all">
          <Search className="h-5 w-5 text-astro-muted" />
          <input 
            type="text" 
            placeholder="Suchen nach Kunde oder Produkt..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-astro-muted"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={handleExportCSV}
          className="astro-card px-4 py-2.5 flex items-center gap-2 text-sm text-astro-muted hover:text-astro-gold hover:border-astro-gold/30 transition-all shadow-lg"
          title="Alle Bestellungen als CSV exportieren"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <div className="relative">
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={cn(
              "astro-card px-4 py-2.5 flex items-center gap-2 text-sm transition-all",
              statusFilter !== 'all' ? "text-astro-gold border-astro-gold/50" : "text-astro-muted hover:text-white"
            )}
          >
            <Filter className="h-4 w-4" />
            {statusFilter === 'all' ? 'Filter' : ORDER_STATUS_LABELS[statusFilter as keyof typeof ORDER_STATUS_LABELS]}
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsFilterOpen(false)}
                />
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 glass-panel z-20 py-2 border border-white/10"
                >
                  <button 
                    onClick={() => { setStatusFilter('all'); setIsFilterOpen(false); }}
                    className={cn("w-full text-left px-4 py-2 text-xs hover:bg-white/5", statusFilter === 'all' && "text-astro-gold font-bold")}
                  >
                    Alle Status
                  </button>
                  {Object.entries(ORDER_STATUS_LABELS).map(([key, label]) => (
                    <button 
                      key={key}
                      onClick={() => { setStatusFilter(key); setIsFilterOpen(false); }}
                      className={cn("w-full text-left px-4 py-2 text-xs hover:bg-white/5", statusFilter === key && "text-astro-gold font-bold")}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Orders List */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full custom-table border-collapse">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Kunde (Snapshot)</th>
                <th>Produkt</th>
                <th>Typ</th>
                <th>Geliefert</th>
                <th>Nächste Lieferung</th>
                <th>Status</th>
                <th>Umsatz</th>
                <th className="text-right">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex justify-center flex-col items-center gap-3">
                       <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-astro-gold"></div>
                       <span className="text-xs text-astro-muted uppercase tracking-widest">Sterne werden ausgerichtet...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-astro-muted italic">
                    Keine Aufträge in diesem Sektor gefunden.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      <div>
                        <span className="font-medium text-slate-100 group-hover:text-astro-gold transition-colors">{order.customerSnapshot.firstName} {order.customerSnapshot.lastName}</span>
                        <br />
                        <span className="text-[10px] text-astro-muted">* {order.customerSnapshot.birthDate || 'Unbekannt'} ({order.customerSnapshot.zodiacSign || 'Kein SZ'})</span>
                      </div>
                    </td>
                    <td>{order.productName}</td>
                    <td>
                      <span className={cn(
                        "text-[10px] px-2 py-0.5 rounded",
                        order.productType === 'subscription' ? "bg-indigo-900/30 text-indigo-300" : "bg-slate-800 text-slate-300"
                      )}>
                        {order.productType === 'subscription' ? 'Abonnement' : 'Einmalig'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleDelivery(order.id, order.status);
                        }}
                        className={cn(
                          "p-2 rounded-full transition-all",
                          order.status === 'delivered' 
                            ? "bg-green-400/20 text-green-400 hover:bg-green-400/30" 
                            : "bg-white/5 text-astro-muted hover:bg-white/10 hover:text-astro-gold"
                        )}
                        title={order.status === 'delivered' ? "Als nicht geliefert markieren" : "Als geliefert markieren"}
                      >
                        {order.status === 'delivered' ? <CheckCircle className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>
                    </td>
                    <td>
                      <div className={cn(
                        "flex items-center gap-1.5",
                        order.status === 'delivered' ? "text-green-400/60" : "text-blue-300"
                      )}>
                        <Truck className="h-3 w-3" />
                        <span className="text-xs">{order.nextDeliveryDate ? formatDate(order.nextDeliveryDate) : 'Pending'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        "status-badge",
                        order.status === 'open' && "bg-astro-gold/10 text-astro-gold border-astro-line",
                        order.status === 'delivered' && "bg-green-400/10 text-green-400 border-green-400/20",
                        order.status === 'cancelled' && "bg-red-400/10 text-red-400 border-red-400/20",
                        order.status === 'in-progress' && "bg-blue-400/10 text-blue-400 border-blue-400/20",
                        order.status === 'waiting-for-pdf' && "bg-purple-400/10 text-purple-400 border-purple-400/20",
                      )}>
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="font-medium text-slate-100">
                      {formatPrice(order.price)}
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="text-astro-gold hover:underline text-xs font-bold uppercase tracking-widest">
                          Details
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-red-400/10 text-astro-muted hover:text-red-400 transition-all"
                          title="Bestellung löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Entry Form Modal */}
      <AnimatePresence>
        {isFormOpen && (
          <OrderForm onClose={() => setIsFormOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderForm({ onClose }: { onClose: () => void }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('new');
  const [selectedProductId, setSelectedProductId] = useState<string>(CATALOG[0].id);
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dbService.getCustomers().then(setCustomers);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const zodiacSign = getZodiacSign(customerData.birthDate);
      const customerDataToSave = cleanObject({ ...customerData, zodiacSign });
      
      let finalCustomerId = selectedCustomerId;
      let finalCustomerSnapshot = { ...customerDataToSave };

      console.log('Order Submission Start:', { selectedCustomerId, selectedProductId, zodiacSign });

      if (selectedCustomerId === 'new') {
        const customerRef = await dbService.addCustomer(customerDataToSave);
        if (!customerRef) throw new Error("Kunde konnte nicht angelegt werden.");
        finalCustomerId = customerRef.id;
        toast.success('Neuer Kunde wurde angelegt.');
      } else {
        const existing = customers.find(c => c.id === selectedCustomerId);
        if (existing) {
          const { id, createdAt, updatedAt, ...rest } = existing;
          finalCustomerSnapshot = cleanObject({
            ...rest,
            ...customerDataToSave
          });
          
          await dbService.updateCustomer(selectedCustomerId, customerDataToSave);
        }
      }

      const product = CATALOG.find(p => p.id === selectedProductId)!;
      const now = new Date();
      const nextDeliveryDate = addHours(now, 48).toISOString();

      console.log('Finalizing Order Payload:', {
        customerId: finalCustomerId,
        productName: product.name,
        productType: product.type,
        price: product.price
      });

      const orderRef = await dbService.addOrder({
        customerId: finalCustomerId,
        customerSnapshot: finalCustomerSnapshot,
        productId: product.id,
        productName: product.name,
        price: product.price,
        productType: product.type,
        status: 'open',
        paymentStatus: 'pending',
        orderSource: 'manual',
        nextDeliveryDate,
      });

      console.log('Order Reference obtained:', orderRef?.id);

      if (!orderRef) throw new Error("Bestellung konnte nicht angelegt werden.");

      toast.success('Bestellung erfolgreich angelegt!');
      onClose();
    } catch (err: any) {
      console.error('Order Submission Error:', err);
      let message = 'Fehler beim Speichern der Bestellung.';
      try {
        const parsed = JSON.parse(err.message);
        if (parsed.error) message = `Fehler: ${parsed.error}`;
      } catch {
        message = err.message || message;
      }
      toast.error(message, { duration: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = CATALOG.find(p => p.id === selectedProductId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      ></motion.div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-4xl astro-card p-0 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-astro-gold/10 flex items-center justify-between bg-white/5">
          <h3 className="text-xl font-bold gold-gradient-text italic">Neue Bestellung erfassen</h3>
          <button onClick={onClose} className="text-astro-muted hover:text-white transition-all">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
          {/* Section 1: Customer Selection */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 bg-astro-gold rounded-full"></div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-astro-gold">Kundendaten</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Kunde auswählen</label>
                <select 
                  value={selectedCustomerId}
                  onChange={(e) => {
                    setSelectedCustomerId(e.target.value);
                    if (e.target.value !== 'new') {
                      const c = customers.find(cust => cust.id === e.target.value);
                      if (c) {
                        setCustomerData({
                          firstName: c.firstName,
                          lastName: c.lastName,
                          email: c.email,
                          phone: c.phone || '',
                          birthDate: c.birthDate || '',
                          birthTime: c.birthTime || '',
                          birthPlace: c.birthPlace || '',
                          notes: c.notes || ''
                        });
                      }
                    } else {
                      setCustomerData({
                        firstName: '', lastName: '', email: '', phone: '',
                        birthDate: '', birthTime: '', birthPlace: '', notes: ''
                      });
                    }
                  }}
                  className="w-full input-astro appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%23D4AF37%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat"
                >
                  <option value="new">Neuen Kunden anlegen</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} ({c.email})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manual Customer Data (Always visible but prepopulated if existing selected) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Vorname *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Max"
                  className="w-full input-astro"
                  value={customerData.firstName}
                  onChange={e => setCustomerData(prev => ({...prev, firstName: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Nachname *</label>
                <input 
                  type="text" 
                  required
                  placeholder="Mustermann"
                  className="w-full input-astro"
                  value={customerData.lastName}
                  onChange={e => setCustomerData(prev => ({...prev, lastName: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">E-Mail *</label>
                <input 
                  type="email" 
                  required
                  placeholder="max@beispiel.de"
                  className="w-full input-astro"
                  value={customerData.email}
                  onChange={e => setCustomerData(prev => ({...prev, email: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Telefonnummer</label>
                <input 
                  type="tel" 
                  placeholder="+49 123 456789"
                  className="w-full input-astro"
                  value={customerData.phone}
                  onChange={e => setCustomerData(prev => ({...prev, phone: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Geburtsdatum</label>
                <input 
                  type="date" 
                  className="w-full input-astro"
                  value={customerData.birthDate}
                  onChange={e => setCustomerData(prev => ({...prev, birthDate: e.target.value}))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Geburtszeit</label>
                <input 
                  type="time" 
                  className="w-full input-astro"
                  value={customerData.birthTime}
                  onChange={e => setCustomerData(prev => ({...prev, birthTime: e.target.value}))}
                />
              </div>
              <div className="space-y-2 lg:col-span-1">
                <label className="text-xs font-bold text-astro-muted uppercase">Geburtsort</label>
                <input 
                  type="text" 
                  placeholder="Berlin"
                  className="w-full input-astro"
                  value={customerData.birthPlace}
                  onChange={e => setCustomerData(prev => ({...prev, birthPlace: e.target.value}))}
                />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-xs font-bold text-astro-muted uppercase">Notizen</label>
                <input 
                  type="text" 
                  placeholder="Wichtige Infos..."
                  className="w-full input-astro"
                  value={customerData.notes}
                  onChange={e => setCustomerData(prev => ({...prev, notes: e.target.value}))}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Product Allocation */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1 bg-blue-400 rounded-full"></div>
              <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400">Produktdetails</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-astro-muted uppercase">Produkt auswählen</label>
                  <select 
                    required
                    value={selectedProductId}
                    onChange={e => setSelectedProductId(e.target.value)}
                    className="w-full input-astro appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%2360a5fa%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:20px] bg-[right_1rem_center] bg-no-repeat"
                  >
                    {CATALOG.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({formatPrice(p.price)})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Preview Card */}
              <div className="astro-card p-6 bg-white/5 border-dashed border-astro-gold/30">
                <h5 className="text-sm font-bold opacity-60 uppercase mb-4 tracking-tighter">Zusammenfassung</h5>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-astro-muted">Produkt:</span>
                    <span className="font-bold text-white">{selectedProduct?.name}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-astro-muted">Typ:</span>
                    <span className={cn(
                      "font-bold",
                      selectedProduct?.type === 'subscription' ? "text-blue-400" : "text-astro-gold"
                    )}>
                      {selectedProduct?.type === 'subscription' ? 'Abonnement (3 Monate)' : 'Einmalzahlung'}
                    </span>
                  </div>
                  {selectedProduct?.type === 'subscription' && (
                    <div className="flex items-start gap-2 text-[10px] text-blue-300 mt-2 p-2 bg-blue-400/5 rounded border border-blue-400/10">
                      <Truck className="h-3 w-3 mt-0.5 shrink-0" />
                      <p>Erste Auslieferung innerhalb von 48h. Danach erfolgt die Zustellung alle 7 Tage im Abo-Format.</p>
                    </div>
                  )}
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-bold text-lg">Gesamt:</span>
                    <span className="font-bold text-2xl text-astro-gold">{formatPrice(selectedProduct?.price || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-astro-gold/10 flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-medium"
            >
              Abbrechen
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="btn-gold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-black/50"></div>
                  Speichere...
                </>
              ) : (
                <>
                   <CheckCircle2 className="h-5 w-5" />
                   Bestellung abschließen
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
