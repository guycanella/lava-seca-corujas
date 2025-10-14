import { supabaseServer } from "@/lib/supabaseServer";
import { zodErrorResponse } from "@/lib/utils";
import { UserResponseSchema } from "@/types";
import { NextResponse } from "next/server";

export async function GET() {
    const supabase = await supabaseServer();
    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser();

    if (userError || !user) {
        return NextResponse.json({
            error: "Não autenticado"
        }, { status: 401 });
    }

    const { data: userData, error: userDataError } = await supabase
        .from("v_users_with_apartment")
        .select("id, email, name, apartment_id, apartment_number")
        .eq("id", user.id)
        .single();

    if (userDataError) {
        return NextResponse.json({
            error: userDataError.message
        }, { status: 500 });
    }

    const payload = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        apartment_id: userData.apartment_id,
        apartment_number: userData.apartment_number,
      };
    
    const validated = UserResponseSchema.safeParse(payload);
    if (!validated.success) return zodErrorResponse(validated.error);
    
    return NextResponse.json(validated.data);
}