// Conturile demo (butoanele de conectare rapida de pe /autentificare). Doar emailurile, fara parole.
// Parolele stau in variabile de mediu DEMO_*_PASSWORD si se citesc doar pe server.
export const CONTURI_DEMO = ["admin@zifit.test", "client-demo@zifit.test"];

export const esteContDemo = (email: string | null | undefined) => !!email && CONTURI_DEMO.includes(email.toLowerCase());
