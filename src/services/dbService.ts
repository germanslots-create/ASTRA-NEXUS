import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp,
  type FirestoreDataConverter
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Collection, Customer, Order, Subscription, Product, Activity } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, data?: any) {
  const errInfo: any = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    data: data ? JSON.parse(JSON.stringify(data)) : null,
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    }
  };
  console.error('[Firestore Error Details]:', errInfo);
  throw new Error(JSON.stringify(errInfo));
}

export const dbService = {
  // Generic List Listener
  subscribeToList: <T>(col: Collection, callback: (data: T[]) => void) => {
    if (!db) {
      console.warn(`Firestore not configured. Cannot subscribe to ${col}`);
      callback([]);
      return () => {};
    }
    console.log(`📡 Subscribing to collection: ${col}`);
    const q = query(collection(db, col));
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
      console.log(`✅ Received ${data.length} items from ${col}`);
      callback(data);
    }, (error) => {
      console.error(`❌ Error in subscription to ${col}:`, error);
      handleFirestoreError(error, OperationType.LIST, col);
    });
  },

  // Customers
  async addCustomer(customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!db) throw new Error("Firestore not configured");
    try {
      return await addDoc(collection(db, Collection.CUSTOMERS), {
        ...customer,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, Collection.CUSTOMERS, customer);
    }
  },

  async getCustomers() {
    if (!db) return [];
    try {
      const snapshot = await getDocs(collection(db, Collection.CUSTOMERS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, Collection.CUSTOMERS);
    }
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    if (!db) throw new Error("Firestore not configured");
    try {
      return await updateDoc(doc(db, Collection.CUSTOMERS, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${Collection.CUSTOMERS}/${id}`, updates);
    }
  },

  async deleteCustomer(id: string) {
    if (!db) throw new Error("Firestore not configured");
    try {
      return await deleteDoc(doc(db, Collection.CUSTOMERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${Collection.CUSTOMERS}/${id}`);
    }
  },

  // Orders
  async addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!db) throw new Error("Firestore not configured");
    const orderData = {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    try {
      console.log('Attempting to add Order document...', orderData);
      const docRef = await addDoc(collection(db, Collection.ORDERS), orderData);
      console.log('Order document added successfully:', docRef.id);
      
      // If it's a subscription, also create a subscription record
      if (order.productType === 'subscription') {
        const firstDelivery = new Date();
        firstDelivery.setHours(firstDelivery.getHours() + 48);
        
        const subData = {
          customerId: order.customerId,
          productId: order.productId,
          productName: order.productName,
          status: 'active',
          nextDeliveryDate: firstDelivery.toISOString(),
          cycleMonths: 3,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        
        console.log('Attempting to add Subscription document...', subData);
        await addDoc(collection(db, Collection.SUBSCRIPTIONS), subData);
        console.log('Subscription document added successfully');
      }

      return docRef;
    } catch (error) {
      console.error('addOrder failure:', error);
      handleFirestoreError(error, OperationType.CREATE, Collection.ORDERS, orderData);
    }
  },

  async updateOrder(id: string, updates: Partial<Order>) {
    if (!db) throw new Error("Firestore not configured");
    try {
      return await updateDoc(doc(db, Collection.ORDERS, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${Collection.ORDERS}/${id}`, updates);
    }
  },

  async deleteOrder(id: string) {
    if (!db) throw new Error("Firestore not configured");
    try {
      return await deleteDoc(doc(db, Collection.ORDERS, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${Collection.ORDERS}/${id}`);
    }
  },

  async getOrdersByCustomer(customerId: string) {
    if (!db) return [];
    try {
      const q = query(
        collection(db, Collection.ORDERS), 
        where('customerId', '==', customerId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${Collection.ORDERS}?customerId=${customerId}`);
    }
  },

  // Products
  async getProducts() {
    if (!db) return [];
    try {
      const snapshot = await getDocs(collection(db, Collection.PRODUCTS));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, Collection.PRODUCTS);
    }
  },

  async getProduct(id: string) {
    if (!db) return null;
    try {
      const d = await getDoc(doc(db, Collection.PRODUCTS, id));
      return d.exists() ? { id: d.id, ...d.data() } as Product : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `${Collection.PRODUCTS}/${id}`);
    }
  },

  // Subscriptions
  async updateSubscription(id: string, updates: Partial<Subscription>) {
    if (!db) throw new Error("Firestore not configured");
    try {
      return await updateDoc(doc(db, Collection.SUBSCRIPTIONS, id), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${Collection.SUBSCRIPTIONS}/${id}`, updates);
    }
  }
};
