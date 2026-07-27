// Excludes visually-ambiguous characters (0/O, 1/I/l) since guests will be
// typing this on a phone off a printed card or a text message.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const LENGTH = 10; // long enough that brute-forcing it isn't casual — see SCHEMA.md

export function generateGuestCode(): string {
  const bytes = new Uint32Array(LENGTH);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}
