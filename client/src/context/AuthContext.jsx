import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile from Firestore
    const fetchUserProfile = async (uid) => {
        try {
            const docRef = doc(db, 'users', uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setUserProfile(docSnap.data());
            } else {
                // Create default profile
                const defaultProfile = {
                    mobile: '',
                    address: '',
                    createdAt: new Date().toISOString()
                };
                await setDoc(docRef, defaultProfile);
                setUserProfile(defaultProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Sign in with Google
    const signInWithGoogle = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await fetchUserProfile(result.user.uid);
            return result.user;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    };

    // Sign out
    const logout = async () => {
        try {
            await signOut(auth);
            setUserProfile(null);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    };

    // Update user profile
    const updateUserProfile = async (profileData) => {
        if (!user) return;

        try {
            const docRef = doc(db, 'users', user.uid);
            await setDoc(docRef, {
                ...userProfile,
                ...profileData,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setUserProfile(prev => ({ ...prev, ...profileData }));
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    };

    // Save order to Firestore
    const saveOrder = async (orderData) => {
        if (!user) return;

        try {
            const orderRef = doc(db, 'orders', `${user.uid}_${Date.now()}`);
            await setDoc(orderRef, {
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                ...orderData,
                createdAt: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error saving order:', error);
            throw error;
        }
    };

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                await fetchUserProfile(currentUser.uid);
            } else {
                setUserProfile(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        user,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
        updateUserProfile,
        saveOrder
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
