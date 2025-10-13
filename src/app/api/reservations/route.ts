import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const supabase = await supabaseServer();
  const { searchParams } = new URL(req.url);
  const day = searchParams.get('day');
  const machine = searchParams.get('machine');

  if (!day) return NextResponse.json({ error: 'Missing day' }, { status: 400 });
  if (!machine) return NextResponse.json({ error: 'Missing machine' }, { status: 400 });

  const dayStart = new Date(day);
  const dayEnd = new Date(day);
  dayEnd.setDate(dayEnd.getDate() + 1);

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
    .gte('start_time', dayStart.toISOString())
    .lt('start_time', dayEnd.toISOString())
    .eq('equipment', machine)
    .order('start_time');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}