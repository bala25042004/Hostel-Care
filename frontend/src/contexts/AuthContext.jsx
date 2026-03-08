import { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch additional user data from Firestore
    const fetchUserData = async (uid) => {
        try {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserData({ id: userDoc.id, ...userDoc.data() });
            } else {
                setUserData(null);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const signup = async (email, password, additionalData) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Save user to Firestore
            const newUserData = {
                email: user.email,
                createdAt: new Date().toISOString(),
                ...additionalData
            };

            await setDoc(doc(db, 'users', user.uid), newUserData);
            await fetchUserData(user.uid);

            return user;
        } catch (error) {
            throw error;
        }
    };

    const login = async (email, password) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const logout = () => {
        setUserData(null);
        return signOut(auth);
    };

    const loginWithGoogle = async (additionalData = null) => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;

            // Check if user exists in Firestore
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (!userDoc.exists()) {
                // If not, created them (useful for Google Sign-Up on Register page)
                const newUserData = {
                    name: user.displayName,
                    email: user.email,
                    profilePic: user.photoURL,
                    createdAt: new Date().toISOString(),
                    role: 'student', // default fallback
                    ...additionalData
                };
                await setDoc(doc(db, 'users', user.uid), newUserData);
            }

            await fetchUserData(user.uid);
            return user;
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                await fetchUserData(user.uid);
            } else {
                setUserData(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userData,
        signup,
        login,
        logout,
        loginWithGoogle,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
