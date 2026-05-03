import React, { createContext, useState, useContext, useEffect } from 'react';
import { API_BASE } from '../config/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [inventoryProducts, setInventoryProducts] = useState([]);
  const [users,    setUsers]    = useState([]);
  const [payments, setPayments] = useState([]);
  const [reviews,  setReviews]  = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      // Logic for fetching payment data can be added here if needed
      console.log('Payment module initialized');
    } catch (error) {
      console.log('Admin data fetch error:', error);
    }
  };


  // Derived Stats
  const stats = {
    revenue: payments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0),
    orders:        payments.length,
    customers:     users.length, // Total users for now
    totalProducts: inventoryProducts.length,
  };

  return (
    <AdminContext.Provider value={{
      inventoryProducts, setInventoryProducts,
      users, setUsers,
      payments, setPayments,
      reviews, setReviews,
      stats,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
