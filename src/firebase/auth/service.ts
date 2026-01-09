'use client';

import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates the Google Sign-In flow using a popup.
 * @param auth - The Firebase Auth instance.
 * @param firestore - The Firestore instance.
 */
export async function signInWithGoogle(auth: Auth, firestore: Firestore) {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Create or update user profile in Firestore
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
      id: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    };
    
    // Use non-blocking write
    setDoc(userRef, userData, { merge: true }).catch(error => {
        errorEmitter.emit(
            'permission-error',
            new FirestorePermissionError({
                path: userRef.path,
                operation: 'write',
                requestResourceData: userData,
            })
        );
    });

  } catch (error) {
    console.error("Error during Google sign-in:", error);
    // Handle specific errors (e.g., popup closed) if necessary
  }
}

/**
 * Signs the current user out.
 * @param auth - The Firebase Auth instance.
 */
export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
  }
}
