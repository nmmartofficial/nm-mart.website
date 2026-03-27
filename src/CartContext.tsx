import React, { createContext, useContext, useState, ReactNode } from 'react';

// कार्ट की पूरी सेटिंग यहाँ है
const CartContext = createContext<any>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartCount, setCartCount] = useState(0);
  
  // सामान जोड़ने का फंक्शन
  const addToCart = () => {
    setCartCount(prev => prev + 1);
    console.log("Item added to NM MART Cart");
  };

  return (
    <CartContext.Provider value={{ cartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
