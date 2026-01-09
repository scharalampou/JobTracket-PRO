
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
export function signInWithGoogle(auth: Auth, firestore: Firestore) {
  const provider = new GoogleAuthProvider();
  // It's better to call signInWithRedirect and not await it,
  // as it navigates away from the current page.
  signInWithRedirect(auth, provider).catch((error) => {
    console.error("Error starting Google sign-in redirect:", error);
  });
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
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      };
      
      // Use non-blocking write, but catch potential permission errors
      setDoc(userRef, userData, { merge: true }).catch(error => {
          // This will be caught by the global error handler
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
     return result; // Return the result
  } catch (error: any) {
    // This can happen if the user is not coming from a redirect.
    // We can safely ignore these errors as they are not "real" errors.
    if (error.code !== 'auth/no-auth-event') {
        console.error("Error getting redirect result:", error);
    }
    // Re-throw other errors so the caller can handle them if needed.
    throw error;
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
