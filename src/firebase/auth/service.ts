'use client';

import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc, Firestore, serverTimestamp } from 'firebase/firestore';

/**
 * Creates or updates the user's profile in Firestore upon successful sign-in/sign-up.
 * @param firestore - The Firestore instance.
 * @param user - The Firebase User object from a successful authentication.
 * @param additionalData - Optional additional data to store in the profile.
 */
async function updateUserProfile(firestore: Firestore, user: User, additionalData: Record<string, any> = {}) {
  const userRef = doc(firestore, 'users', user.uid);
  const userData = {
    uid: user.uid,
    email: user.email,
    lastLogin: serverTimestamp(),
    displayName: user.displayName || user.email,
    photoURL: user.photoURL || '',
    ...additionalData,
  };

  try {
    await setDoc(userRef, userData, { merge: true });
  } catch (error) {
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
 * Registers a new user with email and password.
 * @param auth - The Firebase Auth instance.
 * @param firestore - The Firestore instance.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The User object on success.
 * @throws An error on failure.
 */
export async function signUpWithEmailPassword(auth: Auth, firestore: Firestore, email: string, password: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    await updateUserProfile(firestore, userCredential.user);
  }
  return userCredential.user;
}

/**
 * Signs in a user with email and password.
 * @param auth - The Firebase Auth instance.
 * @param firestore - The Firestore instance.
 * @param email - The user's email.
 * @param password - The user's password.
 * @returns The User object on success.
 * @throws An error on failure.
 */
export async function signInWithEmailPassword(auth: Auth, firestore: Firestore, email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  if (userCredential.user) {
    // We update the lastLogin timestamp on sign-in.
    await updateUserProfile(firestore, userCredential.user);
  }
  return userCredential.user;
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