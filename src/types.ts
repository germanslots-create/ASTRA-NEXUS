export enum Collection {
  CUSTOMERS = 'customers',
  ORDERS = 'orders',
  SUBSCRIPTIONS = 'subscriptions',
  PRODUCTS = 'products',
  USERS = 'users',
  ACTIVITIES = 'activities',
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  zodiacSign?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerSnapshot: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>;
  productId: string;
  productName: string;
  price: number;
  productType: 'one-time' | 'subscription';
  subscriptionId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: 'open' | 'in-progress' | 'waiting-for-pdf' | 'done' | 'delivered' | 'cancelled';
  deliveryDate?: string;
  nextDeliveryDate?: string;
  pdfUrl?: string;
  notes?: string;
  orderSource: 'manual' | 'digistore24';
  createdAt: string;
  updatedAt: string;
}

export interface Subscription {
  id: string;
  customerId: string;
  productId: string;
  productName: string;
  status: 'active' | 'paused' | 'cancelled';
  nextDeliveryDate: string;
  cycleMonths: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  type: 'one-time' | 'subscription';
  billingCycleMonths?: number;
  description?: string;
}

export interface AppUser {
  uid: string;
  email: string;
  role: 'admin' | 'employee';
  firstName: string;
  lastName: string;
}

export interface Activity {
  id: string;
  userId: string;
  userName: string;
  type: string;
  description: string;
  timestamp: string;
}
