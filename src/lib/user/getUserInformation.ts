import { UserResponseSchema, UserResponseType } from "@/types";
import { supabaseServer } from "../supabaseServer";

type GetUserInformationSuccess = {
    ok: true;
    data: UserResponseType;
};

type GetUserInformationFailure = {
    ok: false;
    error: string;
};

type GetUserInformationResponse = 
    | GetUserInformationSuccess
    | GetUserInformationFailure;

export async function getUserInformation(
    userId: string
): Promise<GetUserInformationResponse> {
    const supabase = await supabaseServer();
    
    const { data, error } = await supabase
        .from("v_users_with_apartment")
        .select("id, email, name, apartment_id, apartment_number, is_admin")
        .eq("id", userId)
        .single();

    if (error) {
        return {
            ok: false,
            error: `getUserInformation: ${error.message}`
        };
    }

    const payload = {
        id: data.id,
        email: data.email,
        name: data.name,
        apartment_id: data.apartment_id,
        apartment_number: data.apartment_number,
        is_admin: data.is_admin,
      };
    
    const validated = UserResponseSchema.safeParse(payload);
    if (!validated.success) {
        return {
            ok: false,
            error: `getUserInformation validation schema: ${validated.error.message}`
        };
    }

    return { ok: true, data: validated.data };
}