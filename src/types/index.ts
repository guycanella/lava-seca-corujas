export type MachineType = 'lavadora' | 'secadora';
export type MachineEnum = 'washer' | 'dryer';

export type UsersApp = {
    email: string
    name: string
}

export type Reservation = {
    id: string
    user_id: string
    apartment_id: string
    equipment: MachineEnum
    start_time: Date
    end_time: Date
    apartments: { number: string }
    users_app: UsersApp
}