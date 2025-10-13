import { MachineEnum, MachineType } from "@/types";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getMachineName(machine_type: MachineType): MachineEnum {
  return machine_type === 'lavadora' ? 'washer' : 'dryer';
}
