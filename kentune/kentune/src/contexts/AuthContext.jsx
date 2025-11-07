import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebaseAuth';
import { sendPasswordResetEmail, confirmPasswordReset } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, sendEmailVerification } from 'firebase/auth';

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubProfile = null;
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Real-time Firestore profile listener
        try {
          const db = getFirestore();
          const { doc, onSnapshot } = await import('firebase/firestore');
          const docRef = doc(db, 'profiles', firebaseUser.uid);
          unsubProfile = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              setUserProfile(null);
            }
            setLoading(false);
          }, () => setLoading(false));
        } catch (err) {
          setUserProfile(null);
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const fetchUserProfile = (userId) => {
    supabase?.from('user_profiles')?.select('*')?.eq('id', userId)?.single()?.then(({ data, error }) => {
        if (error) {
          console.log('Profile fetch error:', error?.message);
          return;
        }
        setUserProfile(data);
      });
  };

  const signUp = async (email, password, metadata = {}) => {
    // Enforce phone number requirement
    const phone = metadata?.phone?.trim();
    if (!phone || !/^\+?\d{10,15}$/.test(phone.replace(/\s/g, ''))) {
      return { error: 'A valid phone number is required to create an account.' };
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Send email verification
      await sendEmailVerification(userCredential.user);
      // Save user profile to Firestore with all metadata fields
      const db = getFirestore();
      const user = userCredential.user;
      await setDoc(doc(db, 'profiles', user.uid), {
        uid: user.uid,
        email: user.email,
        full_name: metadata?.full_name || '',
        stage_name: metadata?.stage_name || '',
        role: metadata?.role || 'artist',
        mpesa_number: metadata?.mpesa_number || '',
        phone,
        profile_photo: metadata?.profile_photo || '',
        bio: metadata?.bio || '',
        genres: metadata?.genres || [],
        createdAt: new Date().toISOString(),
        paymentStatus: 'unpaid', // Added field
      });
      // Immediately sign out after registration
      await firebaseSignOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kentunez-loggedin-uid');
      }
      return { data: userCredential, error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { data: userCredential, error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kentunez-loggedin-uid');
      }
      return { error: null };
    } catch (error) {
      return { error: 'Sign out failed. Please try again.' };
    }
  };

  // Send password reset email
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error) {
      return { error: error.message || 'Password reset failed. Please try again.' };
    }
  };

  // Confirm password reset (for custom reset page)
  const confirmResetPassword = async (oobCode, newPassword) => {
    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      return { error: null };
    } catch (error) {
      return { error: error.message || 'Password update failed. Please try again.' };
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user?.uid) {
        return { error: 'No user logged in' };
      }
      const db = getFirestore();
      const docRef = doc(db, 'profiles', user.uid);
      await setDoc(docRef, updates, { merge: true });
      // Fetch the updated profile
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
        return { data: docSnap.data(), error: null };
      } else {
        return { error: 'Profile not found after update' };
      }
    } catch (error) {
      return { error: 'Profile update failed. Please try again.' };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    confirmResetPassword,
    updateProfile,
    isFrozen: !!userProfile?.frozen
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}