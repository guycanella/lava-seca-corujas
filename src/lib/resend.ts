import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
    console.warn("RESEND_API_KEY ausente no ambiente.");
}

export const resend = new Resend(apiKey);

export const RESEND_FROM = process.env.RESEND_FROM 
    || "Lavanderia das Corujas <noreply@lavanderiadascorujas.com.br>";

export const RESERVAS_BCC = process.env.RESERVAS_BCC || undefined;