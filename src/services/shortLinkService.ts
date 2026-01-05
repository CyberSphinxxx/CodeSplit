import { ref, set, get, child, push } from "firebase/database";
import { database } from "../config/firebase";



export interface ShortLinkData {
    files: any[];
    createdAt: number;
}

export const createShortLink = async (files: any[]): Promise<string> => {
    try {
        const linksRef = ref(database, 'shortLinks');
        const newLinkRef = push(linksRef);
        const id = newLinkRef.key;

        if (!id) {
            throw new Error("Failed to generate short link ID");
        }

        const data: ShortLinkData = {
            files,
            createdAt: Date.now()
        };

        await set(newLinkRef, data);
        console.log("Successfully created short link with ID:", id);
        return id;
    } catch (error) {
        console.error("Critical error in createShortLink:", error);
        throw error;
    }
};

export const getShortLinkData = async (id: string): Promise<ShortLinkData | null> => {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `shortLinks/${id}`));

    if (snapshot.exists()) {
        return snapshot.val() as ShortLinkData;
    } else {
        return null;
    }
};
