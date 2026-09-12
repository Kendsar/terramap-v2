import type { AuthProvider, AuthResult, AuthUser, LoginCredentials, SignupCredentials } from '@/types/auth';

const MOCK_DELAY_MS = 1200;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const STORAGE_KEY = 'terramap_auth_user';

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Mock authentication provider for local development without Firebase credentials.
 * Not wired up by default — `authService` uses FirebaseAuthProvider.
 * Simulates network latency and realistic success/error responses.
 */
export class MockAuthProvider implements AuthProvider {
  private currentUser: AuthUser | null = null;
  private listeners = new Set<(user: AuthUser | null) => void>();

  constructor() {
    this.currentUser = getStoredUser();
  }

  private setUser(user: AuthUser | null) {
    this.currentUser = user;
    setStoredUser(user);
    this.listeners.forEach((listener) => listener(user));
  }

  async login(credentials: LoginCredentials): Promise<AuthResult> {
    await delay(MOCK_DELAY_MS);

    // Simulate a specific failure case for testing error states
    if (credentials.email === 'fail@test.com') {
      return {
        success: false,
        error: 'Invalid email or password. Please try again.',
      };
    }

    const user: AuthUser = {
      id: 'mock-user-' + Date.now(),
      email: credentials.email,
      displayName: credentials.email.split('@')[0],
      createdAt: new Date().toISOString(),
    };

    this.setUser(user);
    return { success: true, user };
  }

  async signup(credentials: SignupCredentials): Promise<AuthResult> {
    await delay(MOCK_DELAY_MS);

    // Simulate duplicate email
    if (credentials.email === 'exists@test.com') {
      return {
        success: false,
        error: 'An account with this email already exists.',
      };
    }

    const user: AuthUser = {
      id: 'mock-user-' + Date.now(),
      email: credentials.email,
      displayName: credentials.fullName,
      createdAt: new Date().toISOString(),
    };

    this.setUser(user);
    return { success: true, user };
  }

  async resetPassword(email: string): Promise<AuthResult> {
    await delay(MOCK_DELAY_MS);

    if (email === 'notfound@test.com') {
      return {
        success: false,
        error: 'No account found with this email address.',
      };
    }

    return { success: true };
  }

  async logout(): Promise<void> {
    await delay(400);
    this.setUser(null);
  }

  getCurrentUser(): AuthUser | null {
    if (!this.currentUser) {
      this.currentUser = getStoredUser();
    }
    return this.currentUser;
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    this.listeners.add(callback);
    callback(this.getCurrentUser());
    return () => {
      this.listeners.delete(callback);
    };
  }
}
