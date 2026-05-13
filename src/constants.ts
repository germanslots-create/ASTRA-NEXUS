import { Product } from './types';

export const CATALOG: Product[] = [
  { id: 'monats-horoskop', name: 'Monats-Horoskop', price: 9.99, type: 'one-time' },
  { id: 'jahres-horoskop', name: 'Jahres-Horoskop', price: 19.99, type: 'one-time' },
  { id: 'partner-horoskop', name: 'Partner-Horoskop', price: 24.99, type: 'one-time' },
  { id: 'glueckszahlen', name: 'Persönliche Glückszahlen', price: 7.99, type: 'one-time' },
  { id: 'premium-komplett', name: 'Premium Komplettanalyse', price: 39.99, type: 'one-time' },
  { id: 'wochen-standard', name: 'Wochen-Horoskop Standard', price: 6.99, type: 'subscription', billingCycleMonths: 3 },
  { id: 'wochen-premium', name: 'Wochen-Horoskop Premium', price: 9.99, type: 'subscription', billingCycleMonths: 3 },
  { id: 'wochen-glueck', name: 'Glückszahlen der Woche', price: 4.99, type: 'subscription', billingCycleMonths: 3 },
];

export const ORDER_STATUS_LABELS = {
  open: 'Offen',
  'in-progress': 'In Bearbeitung',
  'waiting-for-pdf': 'Wartet auf PDF',
  done: 'Fertig',
  delivered: 'Ausgeliefert',
  cancelled: 'Storniert',
};

export const PAYMENT_STATUS_LABELS = {
  pending: 'Ausstehend',
  paid: 'Bezahlt',
  failed: 'Fehlgeschlagen',
};

export const ZODIAC_SIGNS = [
  'Widder', 'Stier', 'Zwillinge', 'Krebs', 'Löwe', 'Jungfrau',
  'Waage', 'Skorpion', 'Schütze', 'Steinbock', 'Wassermann', 'Fische'
];
