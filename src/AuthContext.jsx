import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';

const getDeviceId = () => {
    let id = localStorage.getItem('edufisica_device_id');
    if (!id) {
        id = 'dev_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('edufisica_device_id', id);
    }
    return id;
};

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isChecking, setIsChecking] = useState(false);
    const [deviceError, setDeviceError] = useState(null);


    useEffect(() => {
        const deviceId = getDeviceId();
        console.log("AuthContext: Device ID:", deviceId);
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("Auth State Changed - User present:", !!firebaseUser);
            if (firebaseUser) {
                setIsChecking(true);
                try {
                    // Get additional user data from Firestore
                    console.log("Fetching user data for:", firebaseUser.uid);
                    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                    const userData = userDoc.exists() ? userDoc.data() : {};

                    console.log("User data fetched:", userData);

                    // Get custom claims (role) from ID token
                    const tokenResult = await firebaseUser.getIdTokenResult();
                    let role = tokenResult.claims.role || userData.role || 'docente';

                    // Define real admin
                    if (firebaseUser.email === 'citymartlamas@gmail.com') {
                        role = 'admin';
                    }

                    // Define users that should have Premium access (the 5 correct users)
                    const premiumEmails = [
                        'citymartlamas@gmail.com',
                        'educacionfisicaai.oficial@gmail.com',
                        'tatianavane28@gmail.com',
                        'juanjm680.jc@gmail.com',
                        'rivaldo@gmail.com'
                    ];



                    const isPremium = role === 'admin' || 
                                     userData.isPremium === true || 
                                     premiumEmails.includes(firebaseUser.email);



                    // CHECK DEVICE LIMIT
                    const deviceId = getDeviceId();
                    const devices = userData.devices || [];
                    const isRegisteredDevice = devices.includes(deviceId);

                    if (!isRegisteredDevice && devices.length >= 2 && role !== 'admin') {
                        console.warn("Device limit exceeded for user:", firebaseUser.uid);
                        setDeviceError("⚠️ LÍMITE DE DISPOSITIVOS ALCANZADO: Ya tienes 2 dispositivos registrados. Por seguridad, cierra sesión en uno de ellos antes de entrar aquí.");

                        await signOut(auth);
                        setUser(null);
                        setLoading(false);
                        return;
                    }

                    // Register new device if there's room (use setDoc merge for safety)
                    if (!isRegisteredDevice && devices.length < 2) {
                        try {
                            await setDoc(doc(db, 'users', firebaseUser.uid), {
                                devices: arrayUnion(deviceId),
                                email: firebaseUser.email, // Ensure email is there
                                role: role // Ensure role is there
                            }, { merge: true });
                        } catch (e) { console.error("Error registering device", e); }
                    }


                    setUser({ ...firebaseUser, ...userData, role, isPremium, devices: [...devices, deviceId] });
                    setDeviceError(null);
                } catch (error) {
                    console.error("Error in Auth State Transition:", error);
                    setDeviceError("Error de conexión con la base de datos. Por favor, recarga la página.");
                    await signOut(auth);
                    setUser(null);
                } finally {
                    setIsChecking(false);
                }
            } else {
                setUser(null);
                setIsChecking(false);
            }

            console.log("Setting loading to false");
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    // Register with email/password
    const register = async (email, password, displayName, extraData = {}) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });

        // Save user profile to Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email,
            displayName,
            role: 'docente',
            dni: extraData.dni || '',
            level: extraData.level || '',
            institution: extraData.institution || '',
            region: extraData.region || '',
            isPremium: false,
            devices: [getDeviceId()], // Register first device
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
                isPremium: false,
                devices: [getDeviceId()],
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
        logout,
        deviceError,
        setDeviceError,
        isChecking
    };


    return (

        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
