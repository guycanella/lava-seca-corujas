import { useState } from "react";
import { Loader2Icon } from "lucide-react";
import { formatInTimeZone } from "date-fns-tz";
import { useQueryClient } from "@tanstack/react-query";

import {
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import { useGlobalLiveRegion } from "@/contexts/GlobalLiveRegion";
import { useUser } from "@/contexts/UserContext";
import { MachinePtBR, MachineEn, MachineRecordType } from "@/types";
import { Times, useReservations } from "@/app/reservar/[machine]/useReservations";
import { buildLocalTime, toggleMachineType } from "@/lib/utils";
import { Button } from "../ui/button";
import { Show } from "../Show/Show";
import { useConfirmDialog } from "./useConfirmDialog";

type ConfirmDialogType = {
    type: MachinePtBR;
    time: Times;
    dayISO: string;
    date: Date;
    onClose?: () => void;
    isOwnReservation: boolean;
    reservationId: string;
    availableMachines: MachineRecordType[];
}

export function ConfirmDialog({
    type,
    time,
    dayISO,
    date,
    onClose,
    isOwnReservation,
    reservationId,
    availableMachines,
}: ConfirmDialogType) {
    const queryClient = useQueryClient();
    const { data } = useUser();
    const { machineEnum } = useReservations();
    const { announce } = useGlobalLiveRegion();
    const {
        createReservationMutation,
        cancelReservationMutation,
    } = useConfirmDialog({ queryClient });

    const [selectedMachineId, setSelectedMachineId] = useState(availableMachines[0]?.id ?? "");

    const selectedMachine = availableMachines.find(m => m.id === selectedMachineId);

    const handleMakeReservation = () => {
        const localTime = buildLocalTime(date, time);
        const startTimeUtcIso = formatInTimeZone(
            localTime,
            "UTC",
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"
        );

        createReservationMutation.mutate({
            start_time: startTimeUtcIso,
            equipment: toggleMachineType(type) as MachineEn,
            machine_id: selectedMachineId,
            dayISO,
            machineEnum,
            announce,
            onClose,
        });
    }

    const handleCancelReservation = (id: string) => {
        cancelReservationMutation.mutate({
            id,
            dayISO,
            machineEnum,
            announce,
            onClose,
        });
    }

    return (
        <AlertDialogContent>
            <Show>
                <Show.When isTrue={isOwnReservation}>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Cancelar reserva</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cancelar a reserva da {type} para o apartamento{" "}
                            {data?.apartment_number} às {time}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            disabled={cancelReservationMutation.isPending}
                            aria-disabled={cancelReservationMutation.isPending}
                        >
                            Fechar
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            onClick={() => handleCancelReservation(reservationId)}
                            disabled={cancelReservationMutation.isPending}
                            aria-disabled={cancelReservationMutation.isPending}
                            aria-label={
                                cancelReservationMutation.isPending
                                    ? "Cancelando…"
                                    : "Cancelar reserva"
                            }
                        >
                            {cancelReservationMutation.isPending
                                ? <><Loader2Icon className="size-4 animate-spin" /> Cancelando...</>
                                : "Cancelar reserva"
                            }
                        </Button>
                    </AlertDialogFooter>
                </Show.When>

                <Show.Else>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar reserva</AlertDialogTitle>
                        <AlertDialogDescription>
                            Reservar {availableMachines.length === 1
                                ? `a ${selectedMachine?.label}`
                                : `uma ${type}`
                            } para o apartamento {data?.apartment_number} às {time}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <Show>
                        <Show.When isTrue={availableMachines.length > 1}>
                            <fieldset
                                className="flex gap-3 px-1"
                                aria-label="Escolha a máquina"
                            >
                                {availableMachines.map((machine) => (
                                    <label
                                        key={machine.id}
                                        className={`flex-1 flex items-center justify-center gap-2 rounded-lg border p-3 cursor-pointer transition-colors
                                            ${selectedMachineId === machine.id
                                                ? "border-primary bg-primary/10 font-medium"
                                                : "border-muted hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="machine"
                                            value={machine.id}
                                            checked={selectedMachineId === machine.id}
                                            onChange={() => setSelectedMachineId(machine.id)}
                                            className="sr-only"
                                        />
                                        {machine.label}
                                    </label>
                                ))}
                            </fieldset>
                        </Show.When>
                    </Show>

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            disabled={createReservationMutation.isPending}
                            aria-disabled={createReservationMutation.isPending}
                        >
                            Cancelar
                        </AlertDialogCancel>
                        <Button
                            type="button"
                            onClick={handleMakeReservation}
                            disabled={createReservationMutation.isPending || !selectedMachineId}
                            aria-disabled={createReservationMutation.isPending || !selectedMachineId}
                            aria-label={
                                createReservationMutation.isPending
                                    ? "Reservando…"
                                    : "Confirmar reserva"
                            }
                        >
                            {createReservationMutation.isPending
                                ? <><Loader2Icon className="size-4 animate-spin" /> Reservando...</>
                                : "Reservar"
                            }
                        </Button>
                    </AlertDialogFooter>
                </Show.Else>
            </Show>
        </AlertDialogContent>
    )
}
