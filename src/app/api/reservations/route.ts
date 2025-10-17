import { NextResponse } from 'next/server';
import { fromZonedTime } from "date-fns-tz";

import { supabaseServer } from '@/lib/supabaseServer';
import { CreateReservationSchema, GetQuerySchema, ReservationArraySchema, ReservationSchema } from '@/types';
import { zodErrorResponse } from '@/lib/utils';

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

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

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

    const { start_time, equipment } = parsed.data;

    const startUtc = new Date(start_time);
    const endUtc = new Date(startUtc.getTime() + 60 * 60 * 1000);

    const { data: userData, error: userDataError } = await supabase
        .from("users_app")
        .select("id, apartment_id")
        .eq("id", user.id)
        .single();

    if (userDataError || !userData?.apartment_id) {
        return NextResponse.json(
            { error: "Usuário sem apartment_id configurado" },
            { status: 400 }
        );
    }

    const {
        data: reservation,
        error: reservationError
    } = await supabase
        .from("reservations")
        .insert([
            {
                user_id: userData.id,
                apartment_id: userData.apartment_id,
                equipment,
                start_time: startUtc.toISOString(),
                end_time: endUtc.toISOString(),
            },
        ])
        .select(
            `
            id, user_id, apartment_id, equipment, start_time, end_time,
            apartments(number),
            users_app(name, email)
            `
        )
        .single();

    if (reservationError) {
        const msg = reservationError.message || "Falha ao criar reserva";
        const status = reservationError.code === "23505" ? 409 : 400;

        return NextResponse.json({ error: msg }, { status });
    }

    const validated = ReservationSchema.safeParse(reservation);
    if (!validated.success) return zodErrorResponse(validated.error);

    return NextResponse.json(validated.data, { status: 201 });
}