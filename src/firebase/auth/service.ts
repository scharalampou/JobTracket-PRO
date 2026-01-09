'use client';

import { 
  Auth, 
  GoogleAuthProvider, 
  signInWithRedirect,
  getRedirectResult as firebaseGetRedirectResult,
  signOut as firebaseSignOut,
  User
} from 'firebase/auth';
import { doc, setDoc, Firestore, serverTimestamp } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * Initiates the Google Sign-In flow using a redirect.
 * @param auth - The Firebase Auth instance.
 */
export function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  // It's better to call signInWithRedirect and not await it,
  // as it navigates away from the current page.
  signInWithRedirect(auth, provider).catch((error) => {
    // This catch is for potential errors during the redirect initiation,
    // though they are rare. The main error handling happens with getRedirectResult.
    console.error("Error starting Google sign-in redirect:", error);
  });
}

/**
 * Creates or updates the user's profile in Firestore.
 * This is a non-blocking write operation.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase User object.
 */
function updateUserProfile(firestore: Firestore, user: User) {
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
    };

    // Use non-blocking write and catch potential permission errors.
    setDoc(userRef, userData, { merge: true }).catch(error => {
        const permissionError = new FirestorePermissionError({
            path: userRef.path,
            operation: 'write', // 'write' covers both create and update with merge:true
            requestResourceData: userData,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Handles the result from a Google Sign-In redirect. This should be called on
 * the page the user is redirected back to after signing in. It will resolve
 * with the sign-in result or `null` if no redirect was in progress.
 * @param auth - The Firebase Auth instance.
 * @param firestore - The Firestore instance.
 * @returns The UserCredential if sign-in was successful, otherwise null.
 */
export async function getRedirectResult(auth: Auth, firestore: Firestore) {
  try {
    const result = await firebaseGetRedirectResult(auth);
    
    // If the sign-in was successful, `result` will be populated.
    if (result && result.user) {
      // Create or update the user's profile in Firestore.
      updateUserProfile(firestore, result.user);
    }
    
    return result; // Return the result (or null if no redirect occurred).

  } catch (error: any) {
    // This specific error code means the function was called when no redirect
    // was in progress (e.g., a user just navigated to the page). We can
    // safely ignore it and let the function return `null`.
    if (error.code !== 'auth/no-auth-event') {
        console.error("Error getting redirect result:", error);
        // Re-throw other, unexpected errors so they can be handled.
        throw error;
    }
    return null; // Explicitly return null for 'auth/no-auth-event'
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
