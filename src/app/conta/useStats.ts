import { StatsResponseType } from "@/types"
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface EventData {
    date: string
    start_time: string
}

export function useStats() {
    async function fetchStats(): Promise<StatsResponseType> {
        const response = await fetch("/api/stats");
    
        const json = await response.json()
    
        if (!response.ok) {
            throw new Error(json?.error || "Error to get statistical data");
        }
    
        return json;
    }

    function formatEventDate(event: EventData): string {
        const dateObj = new Date(event.start_time);

        const day = format(dateObj, 'dd');
        const year = format(dateObj, 'yyyy');
        const time = format(dateObj, 'HH:mm');
        
        const monthRaw = format(dateObj, 'MMM', { locale: ptBR });
        
        const monthCapitalized = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

        return `${day} de ${monthCapitalized} ${year} (${time})`;
    }

    return { fetchStats, formatEventDate }
}
