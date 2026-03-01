import { sendReservationEmail } from "../email/sendReservationEmail";

type PublishReservationCancelledProps = {
    name: string;
    email: string;
    apartment_number: string;
    machine_label: string;
    startUtcIso: string;
}

export async function publishReservationCancelled({
    name,
    email,
    apartment_number,
    machine_label,
    startUtcIso,
}: PublishReservationCancelledProps
) {
    try {
        const toName = name;
        const toEmail = email;

        const result = await sendReservationEmail({
            toName,
            toEmail,
            apartment_number,
            machineLabel: machine_label,
            startUtcIso,
            type: "cancelled",
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