import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { BodyLoginSchema } from "@/types";
import { zodErrorResponse } from "@/lib/utils";

export async function POST(req: Request) {
    const json = await req.json();
    const parsed = BodyLoginSchema.safeParse(json);

    if (!parsed.success) return zodErrorResponse(parsed.error);

    const { email, password } = parsed.data;

    const supabase = await supabaseServer();
    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        const msg = error.message?.toLowerCase().includes("invalid")
            ? "E-mail ou senha inválidos."
            : "Não foi possível entrar. Tente novamente.";

        return NextResponse.json({ error: msg }, { status: 401 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}