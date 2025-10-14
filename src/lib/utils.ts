import { clsx, type ClassValue } from "clsx"
import { NextResponse } from "next/server";
import { twMerge } from "tailwind-merge"
import { z } from "zod";

import { MachineEnum, MachineType } from "@/types";

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
