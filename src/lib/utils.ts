import { clsx, type ClassValue } from "clsx"
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge"
import { z } from "zod";

import {
  MachineEnum,
  MachineType,
  ReservationType,
} from "@/types";
import { ReservationTimes, Times } from "@/app/reservar/[machine]/useReservations";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMachineName(machine_type: MachineType): MachineEnum {
  return machine_type === 'lavadora' ? 'washer' : 'dryer';
}

export function zodErrorResponse(err: z.ZodError, status: number = 400) {
  return NextResponse.json(
    {
      error: "ValidationError",
      details: err.issues.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    },
    { status: status }
  );
}

export const formatName = (name: string | undefined) => {
  if (!name) return "Usuário"
  
  return name.split(" ")[0];
}

export const mapReservationsToTimes = (
  data: ReservationType[] | undefined
) => {
  if (!data) return [];

  if (data.length === 0) return [];

  return data.reduce((acc, reservation) => {
    const dateObj = new Date(reservation.start_time);
    const dateFormatted = format(dateObj, "HH:mm") as Times;
    const apartment = reservation.apartments.number;
    const user = reservation.users_app.name;
    
    const aux = {
      apartment: apartment,
      time: dateFormatted,
      user: user,
    }

    acc.push(aux);

    return acc;
  }, [] as ReservationTimes[])
}

export const getUnavailableTimes = (reservations: ReservationTimes[]) => {
  if (reservations.length === 0) return [];

  return reservations.map((reservation) => reservation.time);
}