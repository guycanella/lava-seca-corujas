import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "@/components/ui/alert-dialog"


export function ConfirmDialog() {
    return (
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>
                    Tem certeza que deseja reservar?
                </AlertDialogTitle>

                <AlertDialogDescription>
                    O horário será reservado para o apartamento tal 
                    no dia tal às tal.
                </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction>Reservar</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    )
}