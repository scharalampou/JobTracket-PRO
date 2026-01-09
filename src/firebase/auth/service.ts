
'use client';

import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult as firebaseGetRedirectResult,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, setDoc, Firestore } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates the Google Sign-In flow using a redirect.
 * @param auth - The Firebase Auth instance.
 */
export async function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithRedirect(auth, provider);
  } catch (error) {
    console.error("Error starting Google sign-in redirect:", error);
  }
}

/**
 * Handles the result from a Google Sign-In redirect.
 * This should be called on the page the user is redirected back to.
 * @param auth - The Firebase Auth instance.
 * @param firestore - The Firestore instance.
 */
export async function getRedirectResult(auth: Auth, firestore: Firestore) {
  try {
    const result = await firebaseGetRedirectResult(auth);
    if (result && result.user) {
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
    }
  } catch (error: any) {
    // This can happen if the user is not coming from a redirect.
    // We can safely ignore these errors.
    if (error.code !== 'auth/no-auth-event') {
        console.error("Error getting redirect result:", error);
    }
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
