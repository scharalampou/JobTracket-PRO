'use client';

import {
  Auth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult as firebaseGetRedirectResult,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, Firestore, serverTimestamp } from 'firebase/firestore';

/**
 * Initiates the Google Sign-In flow using a redirect.
 * This function navigates the user away from the app to the Google sign-in page.
 * @param auth - The Firebase Auth instance.
 */
export function signInWithGoogle(auth: Auth) {
  const provider = new GoogleAuthProvider();
  // Call signInWithRedirect. It does not need to be awaited as it causes a page navigation.
  signInWithRedirect(auth, provider).catch((error: FirebaseError) => {
    // This catch is for the rare case where the redirect itself fails to initiate.
    console.error("Sign-in redirect initiation failed:", {
      code: error.code,
      message: error.message,
    });
  });
}

/**
 * Creates or updates the user's profile in Firestore upon successful sign-in.
 * This is a non-blocking write operation.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase User object from a successful authentication.
 */
async function updateUserProfile(firestore: Firestore, user: User) {
    const userRef = doc(firestore, 'users', user.uid);
    const userData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: serverTimestamp(),
    };

    try {
      // Set the user document. Using { merge: true } prevents overwriting existing
      // data if the document already exists.
      await setDoc(userRef, userData, { merge: true });
    } catch(error) {
      // This is a critical error if we cannot write the user profile.
       if (error instanceof FirebaseError) {
        console.error("Firestore Error: Failed to create/update user profile.", {
          code: error.code,
          message: error.message,
          path: userRef.path,
        });
      } else {
        console.error("An unknown error occurred while writing the user profile.", error);
      }
    }
}

/**
 * Handles the result from a sign-in redirect. This should be called on
 * the page the user is redirected back to. It resolves with the sign-in
 * result or `null` if no redirect was in progress.
 * @param auth - The Firebase Auth instance.
 * @param firestore - The Firestore instance.
 * @returns The UserCredential if sign-in was successful, otherwise null.
 */
export async function getRedirectResult(auth: Auth, firestore: Firestore) {
  try {
    const result = await firebaseGetRedirectResult(auth);

    // If the sign-in was successful, the `result` object will be populated.
    if (result && result.user) {
      // Create or update the user's profile in Firestore.
      await updateUserProfile(firestore, result.user);
    }

    return result; // Return the result (or null if no redirect occurred).

  } catch (error) {
    // This specific error code means the function was called when no redirect
    // was in progress (e.g., a user just navigated to the page). We can
    // safely ignore it and let the function return `null`. All other errors
    // are unexpected and should be thrown to be caught by the caller.
    if (error instanceof FirebaseError && error.code !== 'auth/no-auth-event') {
        console.error("Authentication Error during redirect result processing:", {
            code: error.code,
            message: error.message,
        });
        // Re-throw other, unexpected errors so they can be handled by the UI.
        throw error;
    }
    // For 'auth/no-auth-event', we return null, which is expected behavior.
    return null;
  }
}


/**
 * Signs the current user out.
 * @param auth - The Firebase Auth instance.
 */
export async function signOut(auth: Auth) {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", {
      code: error.code,
      message: error.message,
    });
  }
}
