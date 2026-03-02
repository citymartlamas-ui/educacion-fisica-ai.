import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get additional user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                const userData = userDoc.exists() ? userDoc.data() : {};

                // Get custom claims (role) from ID token
                const tokenResult = await firebaseUser.getIdTokenResult();
                const role = tokenResult.claims.role || userData.role || 'docente';

                setUser({ ...firebaseUser, ...userData, role });
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Register with email/password
    const register = async (email, password, displayName) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });

        // Save user profile to Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email,
            displayName,
            role: 'docente',
            createdAt: serverTimestamp(),
            materials: [],
            savedSessions: []
        });

        return result.user;
    };

    // Login with email/password
    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    // Login with Google
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);

        // Check if user exists in Firestore, if not create profile
        const userDoc = await getDoc(doc(db, 'users', result.user.uid));
        if (!userDoc.exists()) {
            await setDoc(doc(db, 'users', result.user.uid), {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName,
                photoURL: result.user.photoURL,
                role: 'docente',
                createdAt: serverTimestamp(),
                materials: [],
                savedSessions: []
            });
        }

        return result.user;
    };

    // Logout
    const logout = async () => {
        await signOut(auth);
    };

    const value = {
        user,
        loading,
        register,
        login,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
