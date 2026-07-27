import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { type User, onAuthStateChanged, signOut as fbSignOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/config";

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      // Reset to loading on every transition (not just the initial one) —
      // otherwise, after the very first resolution has already set loading
      // to false once, a later sign-in leaves `isAdmin` stale (false) for
      // the async gap while the /admins check below is in flight, and
      // ProtectedRoute briefly renders "not an admin" before it flips true.
      setLoading(true);
      setUser(nextUser);
      if (!nextUser) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }
      // Being signed in only proves you have *a* Firebase Auth account
      // (the web API key is not a secret, so anyone can create one) — the
      // /admins allowlist doc is what actually grants access. See
      // firestore.rules isAdmin() for the enforced version of this check.
      try {
        const snap = await getDoc(doc(db, "admins", nextUser.uid));
        setIsAdmin(snap.exists());
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
  }, []);

  const value: AuthState = {
    user,
    isAdmin,
    loading,
    signOut: () => fbSignOut(auth),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
