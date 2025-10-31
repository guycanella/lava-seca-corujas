import { supabaseServer } from "@/lib/supabaseServer";
import { zodErrorResponse } from "@/lib/utils";
import { DeleteReservationSchema } from "@/types";
import { NextResponse } from "next/server";

import { CancelReservationSchema } from "@/types";
import { publishReservationCancelled } from "@/lib/reservations/publishReservationCancelled";

type Props = {
    params: Promise<{
        id: string;
    }>
}

export async function DELETE(_: Request, { params }: Props) {
    const { id: reservation_id } = await params;

    const parsed = DeleteReservationSchema.safeParse({
        id: reservation_id,
    });

    if (!parsed.success) return zodErrorResponse(parsed.error);

    const supabase = await supabaseServer();
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({
            error: "Usuário não autenticado"
        }, { status: 401 });
    }

    const { data: reservation, error: fetchError } = await supabase
        .from('reservations')
        .select(`
            user_id,
            start_time,
            equipment,
            apartments!inner(number),
            users_app!inner(name, email)
        `)
        .eq('id', reservation_id)
        .single()

    if (fetchError) {
        return NextResponse.json({
            error: fetchError.message
        }, { status: 500 });
    }

    if (!reservation) {
        return NextResponse.json(
          { error: "Reserva não encontrada" },
          { status: 404 }
        );
    }

    if (reservation.user_id !== user.id) {
        return NextResponse.json({
            error: "Usuário não autorizado"
        }, { status: 403 });
    }

    const {
        data: deletedReservation,
        error: deleteError,
    } = await supabase
        .from('reservations')
        .delete()
        .eq('id', reservation_id)
        .select('id')

    if (deleteError) {
        return NextResponse.json({
            error: deleteError.message
        }, { status: 500 });
    }

    if (!deletedReservation || deletedReservation.length === 0) {
        return NextResponse.json({
            error: "Reserva não pôde ser removida"
        }, { status: 403 });
    }

    const parsedReservation = CancelReservationSchema.safeParse(reservation);
    if (!parsedReservation.success)
        return zodErrorResponse(parsedReservation.error);

    const {
        equipment,
        start_time,
        users_app: { name, email },
        apartments: { number }
    } = parsedReservation.data;

    await publishReservationCancelled({
        name,
        email,
        apartment_number: number,
        equipment,
        startUtcIso: start_time,
    })

    return NextResponse.json({ success: true }, { status: 200 });
}