import {
    signInWithPopup,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from 'firebase/auth';
import type {
    ConfirmationResult,
    UserCredential,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ensureFirebase } from '../config/firebase';

// ─── Google Sign-In ──────────────────────────────────────────────────────────

export const signInWithGoogle = async (): Promise<UserCredential> => {
    const { auth, googleProvider } = ensureFirebase();
    return signInWithPopup(auth, googleProvider);
};

// ─── Phone Auth ──────────────────────────────────────────────────────────────

export const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    const { auth } = ensureFirebase();
    const verifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
            // reCAPTCHA solved — can proceed with phone sign-in
        },
    });
    return verifier;
};

export const sendPhoneOtp = async (
    phoneNumber: string,
    recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> => {
    const { auth } = ensureFirebase();
    return signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string
): Promise<UserCredential> => {
    return confirmationResult.confirm(otp);
};

// ─── Firestore User Document ─────────────────────────────────────────────────

interface UserData {
    uid: string;
    name: string;
    email: string;
    role: string;
    createdAt: ReturnType<typeof serverTimestamp>;
}

export const saveUserToFirestore = async (
    uid: string,
    name: string,
    email: string,
    role: string
): Promise<void> => {
    const { db } = ensureFirebase();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const userData: UserData = {
            uid,
            name,
            email,
            role,
            createdAt: serverTimestamp(),
        };
        await setDoc(userRef, userData);
    }
};

export const getUserFromFirestore = async (
    uid: string
): Promise<Record<string, any> | null> => {
    const { db } = ensureFirebase();
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    return userSnap.exists() ? userSnap.data() : null;
};
