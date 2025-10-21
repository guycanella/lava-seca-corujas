"use client"

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format, isSameDay as isSameDayDateFns } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { AlertCircleIcon } from "lucide-react";
import dynamic from "next/dynamic";

// import { Calendar } from "@/components/ui/calendar";
const CalendarClient = dynamic(
    () => import("@/components/ui/calendar").then((mod) => mod.Calendar),
    { ssr: false }
);

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"
import { ReservationType } from "@/types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useReservations } from "./useReservations";
import { Show } from "@/components/Show/Show";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ConfirmDialog } from "@/components/ConfirmDialog/ConfirmDialog";
import { getUnavailableTimes, mapReservationsToTimes } from "@/lib/utils";

export default function CalendarMachinePage() {
    const router = useRouter();
    
    const {
        TIMES,
        fetchReservations,
        startOfToday,
        machineEnum,
        maxDate,
        isSameMonth,
        type,
        renderNotFound
    } = useReservations();
    
    const [date, setDate] = useState<Date>(startOfToday);
    const [openTime, setOpenTime] = useState<string | null>(null);
    const [debouncedDate, setDebouncedDate] = useState<Date>(date);
    const dayISO = debouncedDate.toISOString().slice(0,10)
    
    renderNotFound();

    const {
        data,
        isLoading,
        isError,
        error,
        isFetching,
        refetch
    } = useQuery<ReservationType[]>({
        queryKey: ["reservations", dayISO, machineEnum],
        queryFn: () => fetchReservations(dayISO, machineEnum),
        staleTime: 30_000,
        refetchOnWindowFocus: false,
    })

    const reservations = useMemo(() => {
        return mapReservationsToTimes(data);
    }, [data])

    const unavailableTimes = useMemo(() => {
        return getUnavailableTimes(reservations);
    }, [reservations])

    const isToday = isSameDayDateFns(date, new Date());
    const currentHHMM = format(new Date(), "HH:mm");

    useEffect(() => {
        const id = setTimeout(() => setDebouncedDate(date), 250);
        return () => clearTimeout(id);
    }, [date]);

    const headingId = "reservar-heading";
    const timesRegionId = "times-status";

    return (
        <div className="flex flex-col min-h-screen items-center gap-4 p-4">
            <h1
                className="text-2xl font-bold"
                id={headingId}
                role="heading"
                aria-level={2}
            >
                Reservar {type}
            </h1>

            <div className="flex flex-col w-full items-center gap-4 p-4 xs:flex-row xs:items-start justify-center">

                <section
                    aria-labelledby="calendar-label"
                    className="w-full max-w-3xl flex flex-col items-center gap-4"
                >
                    <h2 id="calendar-label" className="sr-only">
                        Calendário: Escolha uma data
                    </h2>

                    <CalendarClient
                        mode="single"
                        numberOfMonths={ isSameMonth ? 1 : 2 }
                        hidden={{ after: maxDate }}
                        selected={date}
                        onSelect={(newDate) => newDate && setDate(newDate)}
                        disabled={{ before: startOfToday, after: maxDate }}
                        locale={ptBR}
                        required
                        className="rounded-lg border shadow-sm"
                        aria-describedby="calendar-help"
                    />

                    <p id="calendar-help" className="sr-only">
                        Datas passadas e além do limite estão desabilitadas. 
                        Use as setas para navegar pelos meses. 
                        Selecione uma data para ver os horários disponíveis.
                    </p>
                </section>

                <div
                    id={timesRegionId}
                    className="sr-only"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {(
                        () => {
                            if (isLoading || isFetching) {
                                return "Carregando horários...";
                            } else if (isError) {
                                return "Erro ao carregar horários.";
                            } else {
                                return "";
                            }
                        }
                    )()}
                </div>

                <section aria-labelledby="times-label" className="w-full max-w-3xl">
                    <h2 id="times-label" className="sr-only">
                        Horários disponíveis
                    </h2>

                    <Show>
                        <Show.When isTrue={isLoading || isFetching}>
                            <div
                                className="grid grid-cols-2 gap-2 w-full xs:grid-cols-3"
                                aria-busy="true"
                            >
                                {Array.from({ length: TIMES.length / 2 }).map(
                                    (_, index) => (
                                        <Skeleton
                                            key={`skeleton-${index}`}
                                            className="h-[50px] rounded-full"
                                        />
                                    )
                                )}
                            </div>
                        </Show.When>

                        <Show.When isTrue={isError}>
                            <div>
                                <Alert variant="destructive" role="alert">
                                    <AlertCircleIcon aria-hidden="true" />
                                    <AlertTitle>
                                        Erro: {(error as Error)?.message}
                                    </AlertTitle>
                                    <AlertDescription>
                                        <Button
                                            variant="outline"
                                            onClick={() => refetch()}
                                            size="lg"
                                            aria-label="Tentar novamente carregar os horários"
                                        >
                                            Tentar novamente
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            </div>
                        </Show.When>

                        <Show.Else>
                            <div
                                className="grid grid-cols-2 gap-2 w-full xs:grid-cols-3"
                                role="group"
                                aria-labelledby="times-label"
                            >
                                {TIMES.map((time) => {
                                    const passed = isToday && time <= currentHHMM;
                                    const isOccupied = unavailableTimes.includes(time);
                                    const disabled = passed || isOccupied;
                                    const occupiedTime = reservations.find((reservation) => reservation.time === time);
                                    let ariaLabel = "";

                                    if (isOccupied) {
                                        ariaLabel = `
                                            Horário ${time} já está ocupado pelo 
                                            apartamento ${occupiedTime?.apartment}
                                        `;
                                    } else if (passed) {
                                        ariaLabel = `Horário ${time} indisponível`;
                                    } else {
                                        ariaLabel = `Horário ${time} disponível para reserva`;
                                    }

                                    return (
                                        <AlertDialog
                                            key={time}
                                            open={openTime === time}
                                            onOpenChange={
                                                (isOpen) => 
                                                    setOpenTime(isOpen ? time : null)
                                            }
                                        >
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    type="button"
                                                    size="lg"
                                                    className="h-auto py-1"
                                                    aria-label={ariaLabel}
                                                    disabled={disabled}
                                                    onClick={() => setOpenTime(time)}
                                                >
                                                    {time}<br />
                                                    {isOccupied ? occupiedTime?.apartment : ""}

                                                    <span className="sr-only">
                                                        {ariaLabel}
                                                    </span>
                                                </Button>
                                            </AlertDialogTrigger>

                                            <ConfirmDialog
                                                date={debouncedDate}
                                                time={time}
                                                type={type}
                                                dayISO={dayISO}
                                                onClose={() => setOpenTime(null)}
                                            />
                                        </AlertDialog>
                                    )
                                })}
                            </div>
                        </Show.Else>
                    </Show>
                </section>
            </div>


            <Button
                type="button"
                className="w-full max-w-sm cursor-pointer"
                onClick={() => router.back()}
                aria-label="Voltar para a página anterior"
            >
                Voltar
            </Button>
        </div>
    );
}