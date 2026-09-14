const AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'E-mail adresa nije ispravna.',
  'auth/user-disabled': 'Ovaj račun je onemogućen.',
  'auth/user-not-found': 'Ne postoji račun s tim e-mailom.',
  'auth/wrong-password': 'Lozinka nije točna.',
  'auth/invalid-credential': 'E-mail ili lozinka nisu ispravni.',
  'auth/email-already-in-use': 'Račun s tim e-mailom već postoji.',
  'auth/weak-password': 'Lozinka mora imati najmanje 6 znakova.',
  'auth/too-many-requests': 'Previše pokušaja. Pokušajte kasnije.',
  'auth/network-request-failed': 'Nema mrežne veze. Provjerite internet.',
};

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }

  return undefined;
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Došlo je do neočekivane greške.'
): string {
  const code = getErrorCode(error);

  if (code && AUTH_MESSAGES[code]) {
    return AUTH_MESSAGES[code];
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
