import React, { useState } from 'react';
import { X, User, Mail, Phone, Cake, MapPin, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dbService } from '../services/dbService';
import { toast } from 'react-hot-toast';
import { Customer } from '../types';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}

export function AddCustomerModal({ isOpen, onClose, customer }: AddCustomerModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    birthTime: '',
    birthPlace: '',
    notes: ''
  });

  React.useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.firstName || '',
        lastName: customer.lastName || '',
        email: customer.email || '',
        phone: customer.phone || '',
        birthDate: customer.birthDate || '',
        birthTime: customer.birthTime || '',
        birthPlace: customer.birthPlace || '',
        notes: customer.notes || ''
      });
    } else {
      setFormData({
        firstName: '', lastName: '', email: '', phone: '',
        birthDate: '', birthTime: '', birthPlace: '', notes: ''
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast.error('Bitte füllen Sie alle erforderlichen Felder aus (Vorname, Nachname, Email)');
      return;
    }

    setLoading(true);
    try {
      if (customer) {
        await dbService.updateCustomer(customer.id, formData);
        toast.success('Kunde erfolgreich aktualisiert');
      } else {
        await dbService.addCustomer(formData);
        toast.success('Kunde erfolgreich hinzugefügt');
      }
      onClose();
    } catch (error: any) {
      toast.error('Fehler: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl glass-panel z-[70] overflow-hidden"
          >
            <div className="p-6 border-b border-astro-line flex justify-between items-center bg-white/5">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-astro-gold">
                {customer ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}
              </h2>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-astro-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Vorname *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-astro-gold/50" />
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full bg-black/40 border border-astro-line rounded px-10 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                      placeholder="Vorname"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Nachname *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-astro-gold/50" />
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full bg-black/40 border border-astro-line rounded px-10 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                      placeholder="Nachname"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-astro-gold/50" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-black/40 border border-astro-line rounded px-10 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                    placeholder="email@beispiel.de"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-astro-gold/50" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-black/40 border border-astro-line rounded px-10 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Geburtsdatum</label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-astro-gold/50" />
                    <input
                      type="date"
                      value={formData.birthDate}
                      onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                      className="w-full bg-black/40 border border-astro-line rounded px-10 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Geburtszeit</label>
                  <input
                    type="time"
                    value={formData.birthTime}
                    onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                    className="w-full bg-black/40 border border-astro-line rounded px-4 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Geburtsort</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-astro-gold/50" />
                  <input
                    type="text"
                    value={formData.birthPlace}
                    onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                    className="w-full bg-black/40 border border-astro-line rounded px-10 py-2.5 text-xs focus:border-astro-gold outline-none transition-all"
                    placeholder="Stadt, Land"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-widest text-astro-muted font-bold ml-1">Notizen</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-black/40 border border-astro-line rounded px-4 py-2.5 text-xs focus:border-astro-gold outline-none transition-all min-h-[100px] resize-none"
                  placeholder="Zusätzliche Informationen..."
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-6 py-3 rounded border border-astro-line text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-3 btn-gold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    'Kunde speichern'
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
