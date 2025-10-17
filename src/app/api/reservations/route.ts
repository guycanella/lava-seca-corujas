import { NextResponse } from 'next/server';
import { fromZonedTime } from "date-fns-tz";

import { supabaseServer } from '@/lib/supabaseServer';
import {
    CreateReservationSchema,
    GetQuerySchema,
    ReservationArraySchema,
} from '@/types';

import { isErrorWithStatus, toggleMachineType, zodErrorResponse } from '@/lib/utils';
import { createReservation } from '@/lib/reservations/createReservation';
import { publishReservationCreated } from '@/lib/reservations/publishReservationCreated';

const TIME_ZONE = "America/Sao_Paulo";

export async function GET(req: Request) {
    const supabase = await supabaseServer();
    const { searchParams } = new URL(req.url);

    const parsed = GetQuerySchema.safeParse({
            day: searchParams.get("day"),
            machine: searchParams.get("machine"),
    });

    if (!parsed.success) return zodErrorResponse(parsed.error);
    const { day, machine } = parsed.data;

    const localStart = new Date(`${day} 00:00`);
    const localEnd = new Date(`${day} 24:00`);
    const dayStartUtc = fromZonedTime(localStart, TIME_ZONE);
    const dayEndUtc = fromZonedTime(localEnd, TIME_ZONE);

    const { data, error } = await supabase
        .from('reservations')
        .select(`
            id,
            user_id,
            apartment_id,
            equipment,
            start_time,
            end_time,
            apartments!inner(number),
            users_app!inner(name, email)
        `)
        .gte('start_time', dayStartUtc.toISOString())
        .lt('start_time', dayEndUtc.toISOString())
        .eq('equipment', machine)
        .order('start_time');

    if (error) return NextResponse.json(
        { error: error.message }, 
        { status: 500 }
    );

    const validated = ReservationArraySchema.safeParse(data ?? []);
    if (!validated.success) return zodErrorResponse(validated.error);

    return NextResponse.json(validated.data);
}

export async function POST(req: Request) {
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

    const json = await req.json().catch(() => null);
    const parsed = CreateReservationSchema.safeParse(json);
    if (!parsed.success) return zodErrorResponse(parsed.error);

    try {
        const {
            name,
            email,
            apartment_number,
            equipment,
        } = await createReservation({
            userId: user.id,
            startUtcIso: parsed.data.start_time,
            equipment: parsed.data.equipment,
        });

        await publishReservationCreated({
            name,
            email,
            apartment_number,
            equipment,
            startUtcIso: parsed.data.start_time,
        })

        return NextResponse.json({
            name,
            email,
            apartment_number,
            equipment: toggleMachineType(equipment),
            start_time: parsed.data.start_time,
        }, { status: 201 });
    } catch(error: unknown) {
        const status = 
            isErrorWithStatus(error) 
                ? error.status
                : 500;
                
        const message = 
            isErrorWithStatus(error) 
                ? error.message 
                : "Erro ao criar reserva";

        return NextResponse.json({ error: message }, { status });
    }
}