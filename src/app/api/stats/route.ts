import { NextResponse } from 'next/server';
import { subDays } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { supabaseServer } from '@/lib/supabaseServer';
import { StatsResponseSchema, DayOfWeekStatsType, UserLastReservationType } from '@/types';

const TIME_ZONE = "America/Sao_Paulo";

export async function GET(req: Request) {
    const supabase = await supabaseServer();

    // Verificar autenticação
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({
            error: "Usuário não autenticado"
        }, { status: 401 });
    }

    // Calcular data de início (30 dias atrás em UTC)
    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);

    try {
        // 1. Buscar todas as reservas de lavadora do último mês
        const { data: allReservations, error: allReservationsError } = await supabase
            .from('reservations')
            .select('start_time')
            .eq('equipment', 'washer')
            .gte('start_time', thirtyDaysAgo.toISOString())
            .order('start_time', { ascending: false });

        if (allReservationsError) {
            return NextResponse.json(
                { error: allReservationsError.message },
                { status: 500 }
            );
        }

        // 2. Buscar as últimas 3 reservas do usuário (lavadora)
        const { data: userReservations, error: userReservationsError } = await supabase
            .from('reservations')
            .select('start_time')
            .eq('user_id', user.id)
            .eq('equipment', 'washer')
            .gte('start_time', thirtyDaysAgo.toISOString())
            .order('start_time', { ascending: false })
            .limit(3);

        if (userReservationsError) {
            return NextResponse.json(
                { error: userReservationsError.message },
                { status: 500 }
            );
        }

        // 3. Processar estatísticas por dia da semana
        const weekdayMap = new Map<number, number>();
        // Inicializar todos os dias com 0
        for (let i = 0; i < 7; i++) {
            weekdayMap.set(i, 0);
        }

        // Contar reservas por dia da semana
        (allReservations || []).forEach((reservation) => {
            const localDate = toZonedTime(new Date(reservation.start_time), TIME_ZONE);
            const dayOfWeek = localDate.getDay(); // 0 = Domingo, 6 = Sábado
            weekdayMap.set(dayOfWeek, (weekdayMap.get(dayOfWeek) || 0) + 1);
        });

        const weekdayStats: DayOfWeekStatsType[] = Array.from(weekdayMap.entries()).map(
            ([dayOfWeek, count]) => ({
                dayOfWeek,
                count,
            })
        );

        // 4. Processar últimas reservas do usuário
        const userLastReservations: UserLastReservationType[] = (userReservations || []).map(
            (reservation) => {
                const localDate = toZonedTime(new Date(reservation.start_time), TIME_ZONE);
                const year = localDate.getFullYear();
                const month = String(localDate.getMonth() + 1).padStart(2, '0');
                const day = String(localDate.getDate()).padStart(2, '0');

                return {
                    date: `${year}-${month}-${day}`,
                    start_time: reservation.start_time,
                };
            }
        );

        // 5. Validar resposta
        const response = {
            weekdayStats,
            userLastReservations,
        };

        const validated = StatsResponseSchema.safeParse(response);
        if (!validated.success) {
            return NextResponse.json(
                { error: "Erro ao validar dados de estatísticas" },
                { status: 500 }
            );
        }

        return NextResponse.json(validated.data);
    } catch (error: unknown) {
        console.error("Erro ao buscar estatísticas:", error);
        return NextResponse.json(
            { error: "Erro ao buscar estatísticas" },
            { status: 500 }
        );
    }
}
