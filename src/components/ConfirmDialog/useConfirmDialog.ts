import { QueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { MachineEn, Politeness } from "@/types";

type CreateReservationMutationType = {
    start_time: string;
    equipment: "washer" | "dryer";
    dayISO: string;
    machineEnum: MachineEn;
    announce: (message: string, politeness?: Politeness) => void
    onClose?: () => void
}

type CancelReservationMutationType = 
    Omit<CreateReservationMutationType, 
        "start_time" 
        | "equipment"> & {
    id: string;
}

type CreateReservationPayload = Pick<CreateReservationMutationType, "start_time" | "equipment">;
type UseConfirmDialogType = {
    queryClient: QueryClient;
}

export function useConfirmDialog({ queryClient }: UseConfirmDialogType) {
    async function createReservation({ start_time, equipment }: CreateReservationPayload) {
        const res = await fetch("/api/reservations", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ start_time, equipment }),
        });
    
        const json = await res.json();

        if (!res.ok) {
            const msg = json?.error || "Erro ao criar reserva";
    
            if (res.status === 409 || msg.includes("duplicate key") || msg.includes("já existe")) {
                throw new Error("Esse horário acabou de ser reservado por outra pessoa.");
            }
    
            throw new Error(msg);
        }
    
        return json;
    }

    const createReservationMutation = useMutation({
        mutationFn: (payload: CreateReservationMutationType) =>
            createReservation({ start_time: payload.start_time, equipment: payload.equipment }),

        onSuccess: (_, {
            dayISO,
            machineEnum,
            announce,
            onClose,
        }) => {
            queryClient.invalidateQueries({
                queryKey: ["reservations", dayISO, machineEnum],
            });
            toast.success("Reserva criada com sucesso");
            announce("Reserva criada com sucesso.", "polite");
            onClose?.();
        },

        onError: (error: Error, { announce, onClose }) => {
            toast.error("Erro ao tentar reservar", {
                description: `Erro: ${error?.message}`,
            })
            announce("Erro ao tentar reservar", "assertive");
            onClose?.();
        },
    });

    async function cancelReservation({ id }: { id: string }) {
        const res = await fetch(`/api/reservations/${id}`, {
            method: "DELETE",
            credentials: "include",
        });

        const json = await res.json();
    
        if (!res.ok) {
            const msg = json?.error || "Erro ao cancelar a reserva";
    
            throw new Error(msg);
        }
    
        return json;
    }

    const cancelReservationMutation = useMutation({
        mutationFn: ({ id }: CancelReservationMutationType) =>
            cancelReservation({ id }),

        onSuccess: (_, {
            dayISO,
            machineEnum,
            announce,
            onClose,
        }) => {
            queryClient.invalidateQueries({
                queryKey: ["reservations", dayISO, machineEnum],
            });

            toast.success("Reserva cancelada com sucesso");
            announce("Reserva cancelada com sucesso.", "polite");
            onClose?.();
        },

        onError: (error: Error, { announce, onClose }) => {
            toast.error("Erro ao tentar cancelar a reserva", {
                description: `Erro: ${error?.message}`,
            })
            announce("Erro ao tentar cancelar a reserva", "assertive");
            onClose?.();
        },
    });

    return { createReservationMutation, cancelReservationMutation };
}