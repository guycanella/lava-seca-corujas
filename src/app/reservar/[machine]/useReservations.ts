import { notFound, useParams } from "next/navigation";
import {
    addDays,
    startOfDay,
    isSameMonth as isSameMonthDateFns,
} from "date-fns";

import { MachineEn, MachinePtBR, ReservationType } from "@/types";
import { toggleMachineType } from "@/lib/utils";

const TIMES = [
    "00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00",
    "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
    "20:00", "21:00", "22:00", "23:00"
] as const

export type Times = typeof TIMES[number];

export type ReservationTimes = {
    apartment: string;
    time: Times;
    user: string;
}

export function useReservations() {
    const params = useParams<{ machine: MachinePtBR }>();
    const machine = params?.machine ?? "" as MachinePtBR | undefined;

    const startOfToday = startOfDay(new Date());
    const maxDate = addDays(startOfToday, 15);
    const isSameMonth = isSameMonthDateFns(startOfToday, maxDate);
    const type = (machine ?? "").toLowerCase() as MachinePtBR;
    const machineEnum = toggleMachineType(type) as MachineEn;
    
    async function fetchReservations(
        day: string,
        machine_enum: MachineEn
    ): Promise<ReservationType[]> {
        const res = await fetch(
            `/api/reservations?day=${day}&machine=${machine_enum}`, 
            {
                credentials: "include",
                cache: "no-store",
            }
        );
    
        const json = await res.json();
        
        if (!res.ok) throw new Error(json?.error || "Error loading reservations");
    
        return json;
    }

    const renderNotFound = () => {
        if (!["lavadora", "secadora"].includes(type)) {
            notFound();
        }
    }

    return {
        TIMES,
        fetchReservations,
        startOfToday,
        renderNotFound,
        machineEnum,
        maxDate,
        isSameMonth,
        type,
    }
}