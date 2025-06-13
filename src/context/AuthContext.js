import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';
import StorageService from '../services/StorageService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user is already authenticated
    initializeAuth();
    
    // Listen for auth state changes
    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        
        if (session) {
          setSession(session);
          setUser(session.user);
          setIsGuest(false);
        } else {
          setSession(null);
          setUser(null);
          // Don't automatically clear guest status on logout
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const initializeAuth = async () => {
    try {
      // Get current session from Supabase
      const session = await authService.getSession();
      
      if (session) {
        setSession(session);
        setUser(session.user);
        setIsGuest(false);
      }

      // Initialize storage buckets after auth is set up
      try {
        const storageResult = await StorageService.initializeBuckets();
        if (storageResult.success) {
          console.log('Storage buckets initialized successfully');
        } else {
          console.error('Failed to initialize storage buckets:', storageResult.error);
        }
      } catch (storageError) {
        console.error('Storage initialization error:', storageError);
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setIsLoading(true);
      
      const result = await authService.signIn(email, password);
      
      if (result.success) {
        setSession(result.session);
        setUser(result.user);
        setIsGuest(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email, password, profileData) => {
    try {
      setIsLoading(true);
      
      const result = await authService.signUp(email, password, profileData);
      
      if (result.success) {
        if (result.needsEmailConfirmation) {
          return { 
            success: true, 
            needsConfirmation: true,
            message: 'Please check your email to confirm your account'
          };
        } else {
          setSession(result.session);
          setUser(result.user);
          setIsGuest(false);
          return { success: true };
        }
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign up failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithOAuth = async (provider) => {
    try {
      setIsLoading(true);
      
      const result = await authService.signInWithOAuth(provider);
      
      if (result.success) {
        // OAuth flow will redirect and trigger auth state change
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('OAuth sign in failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      
      const result = await authService.signOut();
      
      if (result.success) {
        setUser(null);
        setSession(null);
        setIsGuest(false);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Sign out failed:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email) => {
    try {
      const result = await authService.resetPassword(email);
      return result;
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: error.message };
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  const updateProfile = async (updates) => {
    try {
      const result = await authService.updateUserMetadata(updates);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    isGuest,
    isAuthenticated: !!user || isGuest,
    signIn,
    signUp,
    signOut,
    signInWithOAuth,
    resetPassword,
    continueAsGuest,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 