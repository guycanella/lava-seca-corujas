import { resend, RESEND_FROM, RESERVAS_BCC } from "@/lib/resend";
import ReservationEmail from "@/emails/ReservationEmail";
import { MachineEn, ReservationEmailType } from "@/types";
import { toggleMachineType } from "../utils";

function formatPtBr(dt: Date, timeZone = "America/Sao_Paulo") {
    const d = new Intl.DateTimeFormat("pt-BR", {
      timeZone,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dt);

    const h = new Intl.DateTimeFormat("pt-BR", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
    }).format(dt);

    return { dateStr: d, timeStr: h };
}

export async function sendReservationEmail(options: {
    toEmail: string;
    toName: string;
    equipment: MachineEn;
    apartment_number: string;
    startUtcIso: string;
    type: ReservationEmailType;
  }) {
    if (!resend) {
      throw new Error("Resend client not initialized. Missing RESEND_API_KEY?");
    }
  
    const start = new Date(options.startUtcIso);
    const { dateStr, timeStr } = formatPtBr(start);
  
    const subject = `Sua reserva da ${
      toggleMachineType(options.equipment)
    } foi ${
      options.type === "cancelled" 
        ? "cancelada" 
        : "confirmada"
    }`;

    const result = await resend.emails.send({
        from: RESEND_FROM,
        to: [options.toEmail],
        bcc: RESERVAS_BCC ? [RESERVAS_BCC] : undefined,
        subject,
        react: ReservationEmail({
            name: options.toName,
            equipment: options.equipment,
            apartment_number: options.apartment_number,
            dateStr,
            timeStr,
            type: options.type,
            siteUrl: "https://www.lavanderiadascorujas.com.br",
        }),
    });
  
    return result;
}