import {
    ref,
    get,
    set,
    update,
    serverTimestamp,
    runTransaction
} from "firebase/database";
import { database } from "../config/firebase";

// Type definitions
export interface UserProfileLinks {
    github?: string;
    twitter?: string;
    website?: string;
    linkedin?: string;
}

export interface UserProfile {
    uid: string;
    displayName: string;
    email?: string;
    photoURL?: string;
    bio?: string;
    isPublic?: boolean;
    links?: UserProfileLinks;
    username?: string;
    usernameLower?: string;
    createdAt?: number;
    updatedAt?: number;
}

export interface UpdateUserProfileInput {
    bio?: string;
    displayName?: string;
    isPublic?: boolean;
    links?: UserProfileLinks;
}

const USERS_PATH = "users";
const USERNAMES_PATH = "usernames";

// Username validation regex: only alphanumeric and underscores
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

/**
 * Validates a username format.
 * 
 * @param username - The username to validate
 * @returns Object with isValid boolean and error message if invalid
 */
export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
    if (!username) {
        return { isValid: false, error: "Username is required" };
    }

    if (username.length < 3) {
        return { isValid: false, error: "Username must be at least 3 characters" };
    }

    if (username.length > 20) {
        return { isValid: false, error: "Username must be 20 characters or less" };
    }

    if (!USERNAME_REGEX.test(username)) {
        return { isValid: false, error: "Username can only contain letters, numbers, and underscores" };
    }

    // Reserved usernames
    const reserved = ["admin", "root", "system", "null", "undefined", "api", "www", "mail"];
    if (reserved.includes(username.toLowerCase())) {
        return { isValid: false, error: "This username is reserved" };
    }

    return { isValid: true };
};

/**
 * Checks if a username is available.
 * 
 * @param username - The username to check
 * @returns True if available, false if taken
 */
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    const validation = validateUsername(username);
    if (!validation.isValid) {
        return false;
    }

    const usernameLower = username.toLowerCase();
    const usernameRef = ref(database, `${USERNAMES_PATH}/${usernameLower}`);
    const snapshot = await get(usernameRef);

    return !snapshot.exists();
};

/**
 * Claims a username for a user atomically.
 * Uses a transaction to ensure no race conditions.
 * If the user already has a username, the old one is released.
 * 
 * @param userId - The user's ID
 * @param username - The desired username
 * @throws Error if username is invalid, already taken, or transaction fails
 */
export const claimUsername = async (userId: string, username: string): Promise<void> => {
    // Validate username format
    const validation = validateUsername(username);
    if (!validation.isValid) {
        throw new Error(validation.error);
    }

    const usernameLower = username.toLowerCase();
    const usernameRef = ref(database, `${USERNAMES_PATH}/${usernameLower}`);

    // First, get the user's current username to release it later
    const userRef = ref(database, `${USERS_PATH}/${userId}`);
    const userSnapshot = await get(userRef);
    const currentUsernameLower = userSnapshot.exists() ? userSnapshot.val().usernameLower : null;

    // If trying to claim the same username, just return
    if (currentUsernameLower === usernameLower) {
        return;
    }

    // Use transaction for atomicity when claiming new username
    const result = await runTransaction(usernameRef, (currentData) => {
        if (currentData !== null) {
            // Username already exists, abort transaction
            return undefined;
        }
        // Claim the username
        return { uid: userId, createdAt: Date.now() };
    });

    if (!result.committed) {
        throw new Error("Username is already taken");
    }

    // Release the old username if the user had one
    if (currentUsernameLower) {
        const oldUsernameRef = ref(database, `${USERNAMES_PATH}/${currentUsernameLower}`);
        await set(oldUsernameRef, null); // Delete old username document
    }

    // Update the user's profile with the new username
    await update(userRef, {
        username: username,
        usernameLower: usernameLower,
        updatedAt: serverTimestamp()
    });
};

/**
 * Gets a user ID by their username.
 * 
 * @param username - The username to look up
 * @returns The user ID or null if not found
 */
export const getUserIdByUsername = async (username: string): Promise<string | null> => {
    const usernameLower = username.toLowerCase();
    const usernameRef = ref(database, `${USERNAMES_PATH}/${usernameLower}`);
    const snapshot = await get(usernameRef);

    if (snapshot.exists()) {
        return snapshot.val().uid;
    }

    return null;
};

/**
 * Updates a user's profile data.
 * 
 * @param userId - The ID of the user to update
 * @param data - The profile data to update
 */
export const updateUserProfile = async (
    userId: string,
    data: UpdateUserProfileInput
): Promise<void> => {
    const userRef = ref(database, `${USERS_PATH}/${userId}`);

    // Get existing user data first to preserve fields not being updated
    const snapshot = await get(userRef);
    const existingData = snapshot.exists() ? snapshot.val() : {};

    await set(userRef, {
        ...existingData,
        ...data,
        uid: userId,
        updatedAt: serverTimestamp()
    });
};

/**
 * Retrieves a user's profile by their ID.
 * 
 * @param userId - The ID of the user to fetch
 * @returns The user profile or null if not found
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
    const userRef = ref(database, `${USERS_PATH}/${userId}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
        const data = snapshot.val();
        return {
            uid: userId,
            displayName: data.displayName || "",
            email: data.email,
            photoURL: data.photoURL,
            bio: data.bio || "",
            isPublic: data.isPublic ?? false,
            links: data.links || {},
            username: data.username,
            usernameLower: data.usernameLower,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }

    return null;
};

/**
 * Creates or updates a user profile from Firebase Auth data.
 * Called typically after user signs in to ensure profile exists.
 * 
 * @param userId - The user's Firebase Auth UID
 * @param authData - Basic auth data from Firebase Auth
 */
export const ensureUserProfile = async (
    userId: string,
    authData: {
        displayName?: string | null;
        email?: string | null;
        photoURL?: string | null;
    }
): Promise<void> => {
    const userRef = ref(database, `${USERS_PATH}/${userId}`);
    const snapshot = await get(userRef);

    if (!snapshot.exists()) {
        // Create new profile for first-time users
        await set(userRef, {
            uid: userId,
            displayName: authData.displayName || "",
            email: authData.email || "",
            photoURL: authData.photoURL || "",
            bio: "",
            isPublic: false,
            links: {},
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    } else {
        // Update auth-related fields only (preserve existing profile data)
        await update(userRef, {
            displayName: authData.displayName || snapshot.val().displayName || "",
            email: authData.email || snapshot.val().email || "",
            photoURL: authData.photoURL || snapshot.val().photoURL || "",
            updatedAt: serverTimestamp()
        });
    }
};

