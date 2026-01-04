import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyC0JZ1uuVPOm1d15b5P4v7momA65c08mu4",
    authDomain: "codesplit-5a1fc.firebaseapp.com",
    projectId: "codesplit-5a1fc",
    storageBucket: "codesplit-5a1fc.firebasestorage.app",
    messagingSenderId: "732754365918",
    appId: "1:732754365918:web:a4aa7da1b067e8a0ef614f",
    measurementId: "G-4JR6J68EPE",
    // This is the default URL for your project ID. 
    // If you are in a different region (like Europe or Asia), it might be different.
    // Ensure you check your Firebase Console -> Project Settings -> General to confirm.
    databaseURL: "https://codesplit-5a1fc-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
