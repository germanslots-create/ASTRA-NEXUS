/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Customers } from './pages/Customers';
import { Subscriptions } from './pages/Subscriptions';
import { Products } from './pages/Products';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';

function PrivateRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-astro-dark">
        <div className="h-8 w-8 animate-spin rounded-full border-t-2 border-astro-gold"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <SearchProvider>
          <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#141415',
              color: '#fff',
              border: '1px solid rgba(212, 175, 55, 0.2)',
            },
          }} 
        />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="orders" element={<Orders />} />
            <Route path="customers" element={<Customers />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="products" element={<Products />} />
          </Route>
        </Routes>
        </SearchProvider>
      </AuthProvider>
    </Router>
  );
}
