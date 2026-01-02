import {
    createContext,
    useContext,
    useEffect,
    useState,
    useRef
} from "react";
import type { ReactNode } from "react";
import {
    GithubAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "firebase/auth";
import type { User } from "firebase/auth";
import { auth } from "../config/firebase";
import { ensureUserProfile } from "../services/userService";

// Define the shape of our auth context
interface AuthContextType {
    user: User | null;
    loading: boolean;
    logInWithGithub: () => Promise<void>;
    logOut: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component props
interface UserAuthContextProviderProps {
    children: ReactNode;
}

// Provider component that wraps the application
export const UserAuthContextProvider = ({ children }: UserAuthContextProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const profileSyncedRef = useRef<string | null>(null);

    // Login with GitHub using popup
    const logInWithGithub = async (): Promise<void> => {
        const provider = new GithubAuthProvider();
        await signInWithPopup(auth, provider);
    };

    // Logout the current user
    const logOut = async (): Promise<void> => {
        profileSyncedRef.current = null; // Reset on logout
        await signOut(auth);
    };

    // Track authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            // Create/update user profile in database when user logs in
            // Only sync once per session per user to prevent infinite loops
            if (currentUser && profileSyncedRef.current !== currentUser.uid) {
                profileSyncedRef.current = currentUser.uid;
                try {
                    await ensureUserProfile(currentUser.uid, {
                        displayName: currentUser.displayName,
                        email: currentUser.email,
                        photoURL: currentUser.photoURL
                    });
                } catch (error) {
                    console.error("Failed to ensure user profile:", error);
                }
            }

            setLoading(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []);

    const value: AuthContextType = {
        user,
        loading,
        logInWithGithub,
        logOut
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to access auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within a UserAuthContextProvider");
    }
    return context;
};
