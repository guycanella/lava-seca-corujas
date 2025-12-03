import { Button } from "../ui/button"
import { Loader2Icon } from "lucide-react"
import { useLogoutButton } from "./useLogoutButton"

export default function LogoutButton() {
    const { handleLogout, isPending } = useLogoutButton()

    return (
        <Button
            onClick={handleLogout}
            disabled={isPending}
            aria-disabled={isPending}
            aria-label={isPending ? "Saindo, aguarde..." : "Sair da conta"}
        >
            {
                isPending ? (
                    <>
                        <Loader2Icon className="size-4 animate-spin" aria-hidden="true" />
                        Saindo...
                    </>
                ) : "Logout"
            }
        </Button>
    )
}
