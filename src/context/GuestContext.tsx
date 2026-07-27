import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

const STORAGE_KEY = "casa360.guestCode";

interface GuestState {
  code: string | null;
  /** Tries a code against Firestore rules (a wrong code gets denied by
   * firestore.rules before any content is returned) and stores it on
   * success. Returns whether it worked. */
  tryUnlock: (candidate: string) => Promise<boolean>;
  lock: () => void;
}

const GuestContext = createContext<GuestState>({
  code: null,
  tryUnlock: async () => false,
  lock: () => {},
});

export function GuestProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<string | null>(() =>
    sessionStorage.getItem(STORAGE_KEY),
  );

  async function tryUnlock(candidate: string): Promise<boolean> {
    const trimmed = candidate.trim();
    if (!trimmed) return false;
    try {
      // A wrong code makes firestore.rules deny this read (see
      // houseManual/{code}/... in firestore.rules), which throws here —
      // that's the only signal we need, whether or not "arrival" has been
      // seeded with content yet.
      await getDoc(doc(db, "houseManual", trimmed, "sections", "arrival"));
      sessionStorage.setItem(STORAGE_KEY, trimmed);
      setCode(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  function lock() {
    sessionStorage.removeItem(STORAGE_KEY);
    setCode(null);
  }

  return (
    <GuestContext.Provider value={{ code, tryUnlock, lock }}>
      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  return useContext(GuestContext);
}
