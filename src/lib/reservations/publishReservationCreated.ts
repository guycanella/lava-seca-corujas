import { MachineEn } from "@/types";
import { sendReservationEmail } from "../email/sendReservationEmail";

type PublishReservationCreatedProps = {
    name: string;
    email: string;
    apartment_number: string;
    equipment: MachineEn;
    startUtcIso: string;
}

export async function publishReservationCreated({
    name,
    email,
    apartment_number,
    equipment,
    startUtcIso
}: PublishReservationCreatedProps
) {
    try {
        const toName = name;
        const toEmail = email;

        const result = await sendReservationEmail({
            toName,
            toEmail,
            apartment_number,
            equipment,
            startUtcIso,
            type: "confirmed",
        })

        if (result.error) {
            console.error("Erro no envio do email:", { error: result.error});
        }
    } catch(error: unknown) {
        if (error instanceof Error) {
            console.error("publishReservationCreated failed:", error.message);
        } else {
            console.error("publishReservationCreated failed:", error);
        }
    }
}