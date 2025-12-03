import { useRouter } from "next/navigation"
import { Button } from "../ui/button"

export default function LoginButton() {
    const router = useRouter()

    const redirectToMyAccount = () => {
        router.push("/conta")
    }

    return (
        <Button
            onClick={redirectToMyAccount}
            aria-label={"Ir para a página Minha Conta"}
        >
            Minha conta
        </Button>
    )

}