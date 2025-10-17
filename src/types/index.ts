import { z } from "zod";

export const formSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .pipe(z.email({ message: "É necessário inserir um e-mail válido" })),
    password: z
        .string()
        .min(8, { message: "Mínimo de 8 caracteres" })
        .max(32, { message: "Máximo de 32 caracteres" }),
});

export const payloadLoginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

const MachineSchema = z.enum(['washer', 'dryer']);

export const GetQuerySchema = z.object({
    day: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato esperado: YYYY-MM-DD"),
    machine: MachineSchema,
});

const isoLike = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;

const isoDateSchema = z
  .string()
  .regex(isoLike, "Data inválida (esperado ISO com hora)")
  .refine((s) => !Number.isNaN(new Date(s).getTime()), "Data inválida (não parseável)");

export const CreateReservationSchema = z.object({
    start_time: isoDateSchema,
    equipment: MachineSchema,
});

const UsersSchema = z.object({
    email: z.email(),
    name: z.string(),
});

export const ReservationSchema = z.object({
    id: z.uuid(),
    user_id: z.uuid(),
    apartment_id: z.uuid(),
    equipment: MachineSchema,
    start_time: isoDateSchema,
    end_time: isoDateSchema,
    apartments: z.object({ number: z.string() }),
    users_app: UsersSchema,
});

export const ReservationArraySchema = z.array(ReservationSchema);

export const UserResponseSchema = z.object({
    id: z.uuid(),
    name: z.string(),
    email: z.email(),
    apartment_id: z.uuid(),
    apartment_number: z.string(),
});

export const BodyLoginSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export type FormValues = z.infer<typeof formSchema>;
export type PayloadLoginType = z.infer<typeof payloadLoginSchema>;
export type MachinePtBR = 'lavadora' | 'secadora';
export type MachineEn = z.infer<typeof MachineSchema>;
export type MachinesType = MachinePtBR | MachineEn;
export type UsersAppType = z.infer<typeof UsersSchema>;
export type ReservationType = z.infer<typeof ReservationSchema>;
export type UserResponseType = z.infer<typeof UserResponseSchema>;