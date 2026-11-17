"use server";

export type ContactState = { trimis: boolean } | undefined;

// Formular de TEST: nu trimite si nu salveaza nimic nicaieri. Continutul mesajului nu se citeste si nu se logheaza.
export async function trimiteMesaj(): Promise<ContactState> {
  return { trimis: true };
}
