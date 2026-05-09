export const GUEST_ID_KEY = "typedeul:guest-id";
export const GUEST_NAME_KEY = "typedeul:guest-name";

export function getOrCreateGuestId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(GUEST_ID_KEY);
  if (existing) {
    return existing;
  }

  const value = `guest_${crypto.randomUUID()}`;
  window.localStorage.setItem(GUEST_ID_KEY, value);
  return value;
}

export function getGuestName() {
  if (typeof window === "undefined") {
    return "Guest";
  }

  const existing = window.localStorage.getItem(GUEST_NAME_KEY);
  if (existing) {
    return existing;
  }

  const generated = `Guest ${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  window.localStorage.setItem(GUEST_NAME_KEY, generated);
  return generated;
}
