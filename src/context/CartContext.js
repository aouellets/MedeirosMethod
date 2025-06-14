import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext({});

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);

  // Load cart from storage on app start
  useEffect(() => {
    loadCartFromStorage();
    loadSavedItemsFromStorage();
  }, []);

  // Save cart to storage whenever cart changes
  useEffect(() => {
    if (!loading) {
      saveCartToStorage();
    }
  }, [cartItems, loading]);

  // Save saved items to storage whenever they change
  useEffect(() => {
    if (!loading) {
      saveSavedItemsToStorage();
    }
  }, [savedItems, loading]);

  const loadCartFromStorage = async () => {
    try {
      const storedCart = await AsyncStorage.getItem('cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCartToStorage = async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  };

  const loadSavedItemsFromStorage = async () => {
    try {
      const storedSavedItems = await AsyncStorage.getItem('savedItems');
      if (storedSavedItems) {
        setSavedItems(JSON.parse(storedSavedItems));
      }
    } catch (error) {
      console.error('Error loading saved items from storage:', error);
    }
  };

  const saveSavedItemsToStorage = async () => {
    try {
      await AsyncStorage.setItem('savedItems', JSON.stringify(savedItems));
    } catch (error) {
      console.error('Error saving saved items to storage:', error);
    }
  };

  const addToCart = (product, selectedSize = null, quantity = 1) => {
    try {
      if (!product || !product.id) {
        return { success: false, message: 'Invalid product' };
      }

      if (!product.inStock) {
        return { success: false, message: 'Product is out of stock' };
      }

      const cartItem = {
        id: `${product.id}-${selectedSize || 'no-size'}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || null,
        size: selectedSize,
        quantity,
        sponsor: product.sponsor,
        category: product.category,
        inStock: product.inStock,
        isAppExclusive: product.isAppExclusive || false,
        addedAt: new Date().toISOString(),
      };

      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.id === cartItem.id);
        
        if (existingItem) {
          // Update quantity if item already exists
          return prevItems.map(item =>
            item.id === cartItem.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Add new item
          return [...prevItems, cartItem];
        }
      });

      return { success: true, message: 'Added to cart successfully' };
    } catch (error) {
      console.error('Error adding to cart:', error);
      return { success: false, message: 'Failed to add item to cart' };
    }
  };

  const removeFromCart = (itemId) => {
    try {
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return { success: true, message: 'Item removed from cart' };
    } catch (error) {
      console.error('Error removing from cart:', error);
      return { success: false, message: 'Failed to remove item' };
    }
  };

  const updateQuantity = (itemId, newQuantity) => {
    try {
      if (newQuantity <= 0) {
        return removeFromCart(itemId);
      }

      if (newQuantity > 99) {
        return { success: false, message: 'Maximum quantity is 99' };
      }

      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );

      return { success: true, message: 'Quantity updated' };
    } catch (error) {
      console.error('Error updating quantity:', error);
      return { success: false, message: 'Failed to update quantity' };
    }
  };

  const moveToSaved = (itemId) => {
    try {
      const item = cartItems.find(item => item.id === itemId);
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      // Add to saved items
      setSavedItems(prevItems => {
        const existingItem = prevItems.find(saved => saved.id === item.id);
        if (existingItem) {
          return prevItems; // Already saved
        }
        return [...prevItems, { ...item, savedAt: new Date().toISOString() }];
      });

      // Remove from cart
      removeFromCart(itemId);
      
      return { success: true, message: 'Item moved to saved items' };
    } catch (error) {
      console.error('Error moving to saved:', error);
      return { success: false, message: 'Failed to save item' };
    }
  };

  const moveToCart = (itemId) => {
    try {
      const item = savedItems.find(item => item.id === itemId);
      if (!item) {
        return { success: false, message: 'Item not found' };
      }

      // Add to cart
      const result = addToCart({
        id: item.productId,
        name: item.name,
        price: item.price,
        originalPrice: item.originalPrice,
        images: item.image ? [item.image] : [],
        sponsor: item.sponsor,
        category: item.category,
        inStock: item.inStock,
        isAppExclusive: item.isAppExclusive,
      }, item.size, item.quantity);

      if (result.success) {
        // Remove from saved items
        setSavedItems(prevItems => prevItems.filter(saved => saved.id !== itemId));
      }

      return result;
    } catch (error) {
      console.error('Error moving to cart:', error);
      return { success: false, message: 'Failed to move item to cart' };
    }
  };

  const removeSavedItem = (itemId) => {
    try {
      setSavedItems(prevItems => prevItems.filter(item => item.id !== itemId));
      return { success: true, message: 'Item removed from saved items' };
    } catch (error) {
      console.error('Error removing saved item:', error);
      return { success: false, message: 'Failed to remove saved item' };
    }
  };

  const clearCart = () => {
    try {
      setCartItems([]);
      setAppliedDiscount(null);
      setDiscountCode('');
      return { success: true, message: 'Cart cleared' };
    } catch (error) {
      console.error('Error clearing cart:', error);
      return { success: false, message: 'Failed to clear cart' };
    }
  };

  const clearSavedItems = () => {
    try {
      setSavedItems([]);
      return { success: true, message: 'Saved items cleared' };
    } catch (error) {
      console.error('Error clearing saved items:', error);
      return { success: false, message: 'Failed to clear saved items' };
    }
  };

  // Discount codes
  const DISCOUNT_CODES = {
    'WELCOME10': { type: 'percentage', value: 10, minOrder: 0, description: '10% off your order' },
    'SAVE20': { type: 'percentage', value: 20, minOrder: 100, description: '20% off orders over $100' },
    'FREESHIP': { type: 'shipping', value: 0, minOrder: 0, description: 'Free shipping' },
    'NEWUSER': { type: 'fixed', value: 15, minOrder: 50, description: '$15 off orders over $50' },
  };

  const applyDiscountCode = (code) => {
    try {
      const upperCode = code.toUpperCase();
      const discount = DISCOUNT_CODES[upperCode];
      
      if (!discount) {
        return { success: false, message: 'Invalid discount code' };
      }

      const subtotal = getCartTotal();
      if (subtotal < discount.minOrder) {
        return { 
          success: false, 
          message: `Minimum order of $${discount.minOrder.toFixed(2)} required` 
        };
      }

      setAppliedDiscount({ code: upperCode, ...discount });
      setDiscountCode(upperCode);
      
      return { success: true, message: `Discount applied: ${discount.description}` };
    } catch (error) {
      console.error('Error applying discount:', error);
      return { success: false, message: 'Failed to apply discount code' };
    }
  };

  const removeDiscountCode = () => {
    try {
      setAppliedDiscount(null);
      setDiscountCode('');
      return { success: true, message: 'Discount code removed' };
    } catch (error) {
      console.error('Error removing discount:', error);
      return { success: false, message: 'Failed to remove discount code' };
    }
  };

  // Calculations
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getShippingCost = () => {
    const subtotal = getCartTotal();
    
    // Free shipping for orders over $75 or if FREESHIP discount is applied
    if (subtotal > 75 || (appliedDiscount && appliedDiscount.type === 'shipping')) {
      return 0;
    }
    
    return 9.99;
  };

  const getTaxAmount = () => {
    const subtotal = getCartTotal();
    const discountAmount = getDiscountAmount();
    const taxableAmount = subtotal - discountAmount;
    
    // 8.5% tax rate
    return Math.max(0, taxableAmount * 0.085);
  };

  const getDiscountAmount = () => {
    if (!appliedDiscount) return 0;

    const subtotal = getCartTotal();
    
    switch (appliedDiscount.type) {
      case 'percentage':
        return subtotal * (appliedDiscount.value / 100);
      case 'fixed':
        return Math.min(appliedDiscount.value, subtotal);
      case 'shipping':
        return getShippingCost(); // This will be 0 since shipping becomes free
      default:
        return 0;
    }
  };

  const getFinalTotal = () => {
    const subtotal = getCartTotal();
    const shipping = getShippingCost();
    const tax = getTaxAmount();
    const discount = getDiscountAmount();
    
    return Math.max(0, subtotal + shipping + tax - discount);
  };

  const isItemInCart = (productId, size = null) => {
    const itemId = `${productId}-${size || 'no-size'}`;
    return cartItems.some(item => item.id === itemId);
  };

  const getItemQuantityInCart = (productId, size = null) => {
    const itemId = `${productId}-${size || 'no-size'}`;
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const isItemSaved = (productId, size = null) => {
    const itemId = `${productId}-${size || 'no-size'}`;
    return savedItems.some(item => item.id === itemId);
  };

  // Order summary for checkout
  const getOrderSummary = () => {
    const subtotal = getCartTotal();
    const shipping = getShippingCost();
    const tax = getTaxAmount();
    const discount = getDiscountAmount();
    const total = getFinalTotal();

    return {
      subtotal,
      shipping,
      tax,
      discount,
      total,
      itemCount: getCartItemCount(),
      appliedDiscount,
    };
  };

  const value = {
    // State
    cartItems,
    savedItems,
    loading,
    discountCode,
    appliedDiscount,
    
    // Cart operations
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    
    // Saved items operations
    moveToSaved,
    moveToCart,
    removeSavedItem,
    clearSavedItems,
    
    // Discount operations
    applyDiscountCode,
    removeDiscountCode,
    
    // Calculations
    getCartTotal,
    getCartItemCount,
    getShippingCost,
    getTaxAmount,
    getDiscountAmount,
    getFinalTotal,
    getOrderSummary,
    
    // Utility functions
    isItemInCart,
    getItemQuantityInCart,
    isItemSaved,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext; 