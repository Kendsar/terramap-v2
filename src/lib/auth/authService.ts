import type { AuthProvider } from '@/types/auth';
import { FirebaseAuthProvider } from './firebaseAuthProvider';

/**
 * Authentication service singleton.
 *
 * Backed by Firebase Authentication (email/password). Requires the
 * NEXT_PUBLIC_FIREBASE_* variables from .env.example and Email/Password
 * sign-in enabled in the Firebase Console.
 *
 * `MockAuthProvider` in this folder implements the same interface and can be
 * swapped in for local development without Firebase credentials.
 */
const authService: AuthProvider = new FirebaseAuthProvider();

export { authService };
