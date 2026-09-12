export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  createdAt?: string;
}

export interface AuthState {
  user: AuthUser | null;
  initializing: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignupCredentials {
  fullName: string;
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<AuthResult>;
  signup(credentials: SignupCredentials): Promise<AuthResult>;
  resetPassword(email: string): Promise<AuthResult>;
  logout(): Promise<void>;
  getCurrentUser(): AuthUser | null;
  /**
   * Observe the restored session. The callback fires once the provider knows
   * whether a user is signed in, then on every subsequent change.
   * Returns an unsubscribe function.
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
}
