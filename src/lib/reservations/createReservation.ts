// lib/reservations/createReservation.ts
import { supabaseServer } from "@/lib/supabaseServer";
import { ReservationSchema, MachineEn } from "@/types";
import { getUserInformation } from "../user/getUserInformation";

type CreateReservationInput = {
    userId: string;
    startUtcIso: string;
    equipment: MachineEn;
    machineId: string;
};

export async function createReservation({
  userId,
  startUtcIso,
  equipment,
  machineId,
}: CreateReservationInput) {
    const supabase = await supabaseServer();
    const userData = await getUserInformation(userId);

    if (!userData.ok) {
        throw Object.assign(
            new Error("Usuário sem apartment_id configurado"), 
            { status: 400 }
        );
    }

    const startUtc = new Date(startUtcIso);
    const endUtc = new Date(startUtc.getTime() + 60 * 60 * 1000);

    const { data: reservation, error: reservationError } = await supabase
        .from("reservations")
        .insert([
            {
                user_id: userData.data.id,
                apartment_id: userData.data.apartment_id,
                equipment,
                machine_id: machineId,
                start_time: startUtc.toISOString(),
                end_time: endUtc.toISOString(),
            },
        ])
        .select(
            `
            id, user_id, apartment_id, equipment, machine_id, start_time, end_time,
            apartments(number),
            users_app(name, email),
            machines(id, label)
            `
        )
        .single();

    if (reservationError) {
        const msg = reservationError.message || "Falha ao criar reserva";
        const status = reservationError.code === "23505" ? 409 : 400;
        
        throw Object.assign(new Error(msg), { status });
    }

    const parsed = ReservationSchema.safeParse(reservation);
    if (!parsed.success) {
        throw Object.assign(
            new Error("Dados de reserva inválidos"), 
            { status: 500 }
        );
    }

    return {
        name: parsed.data.users_app.name,
        email: parsed.data.users_app.email,
        apartment_number: parsed.data.apartments.number,
        equipment: parsed.data.equipment,
        machine_label: parsed.data.machines.label,
    };
}