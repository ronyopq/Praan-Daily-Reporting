import type { SessionUser } from "@/lib/api/client";

const SESSION_SNAPSHOT_KEY = "praan-session-snapshot";
const SESSION_SNAPSHOT_TTL = 1000 * 60 * 30;

type SessionSnapshot = {
  user: SessionUser;
  savedAt: number;
};

export function readSessionSnapshot() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_SNAPSHOT_KEY);

    if (!raw) {
      return null;
    }

    const snapshot = JSON.parse(raw) as SessionSnapshot;

    if (!snapshot?.user || Date.now() - snapshot.savedAt > SESSION_SNAPSHOT_TTL) {
      window.localStorage.removeItem(SESSION_SNAPSHOT_KEY);
      return null;
    }

    return snapshot.user;
  } catch {
    window.localStorage.removeItem(SESSION_SNAPSHOT_KEY);
    return null;
  }
}

export function writeSessionSnapshot(user: SessionUser) {
  if (typeof window === "undefined") {
    return;
  }

  const snapshot: SessionSnapshot = {
    user,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(SESSION_SNAPSHOT_KEY, JSON.stringify(snapshot));
}

export function clearSessionSnapshot() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SESSION_SNAPSHOT_KEY);
}
