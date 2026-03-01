import { NextResponse } from "next/server";
import { z } from "zod";

import { supabaseServer } from "@/lib/supabaseServer";
import { MachineRecordSchema } from "@/types";
import { zodErrorResponse } from "@/lib/utils";

const GetMachinesQuerySchema = z.object({
    type: z.enum(["washer", "dryer"]),
});

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const parsed = GetMachinesQuerySchema.safeParse({
        type: searchParams.get("type"),
    });

    if (!parsed.success) return zodErrorResponse(parsed.error);

    const supabase = await supabaseServer();

    const { data, error } = await supabase
        .from("machines")
        .select("id, type, label, is_active")
        .eq("type", parsed.data.type)
        .eq("is_active", true)
        .order("label");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const validated = z.array(MachineRecordSchema).safeParse(data ?? []);
    if (!validated.success) return zodErrorResponse(validated.error);

    return NextResponse.json(validated.data);
}
