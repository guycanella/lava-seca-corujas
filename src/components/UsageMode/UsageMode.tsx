import { useId } from "react"
import Image from "next/image"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "../ui/dialog"
import { Button } from "../ui/button"

export default function UsageMode() {
    const titleId = useId()
    const descriptionId = useId()
    const imageCaptionId = useId()
    const dialogId = useId()

    return (
        <div className="flex flex-col items-center gap-2 p-4">
            <h3 className="text-lg font-medium" id={`${titleId}-heading`}>
                Sabia que existe maneira {" "}
                <span className="font-bold text-green-wings">
                    correta
                </span> {" "}
                de usar a máquina de lavar?
            </h3>

            <p>
                Clique abaixo e veja a maneira correta de usá-la.
            </p>

            <Dialog>
                <DialogTrigger
                    asChild
                    aria-haspopup="dialog"
                    aria-controls={dialogId}
                >
                    <Button
                        type="button"
                        className="cursor-pointer font-bold text-primary-foreground bg-primary rounded-md px-4 py-2"
                    >
                        Modo de usar
                    </Button>
                </DialogTrigger>
                <DialogContent
                    id={dialogId}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby={titleId}
                    aria-describedby={descriptionId}
                >
                    <DialogHeader>
                        <DialogTitle id={titleId}>
                            Modo de uso correto da máquina de lavar
                        </DialogTitle>

                        <DialogDescription id={descriptionId}>
                            Colocar os produtos nos locais errados pode {" "}
                            <span className="font-bold text-destructive">
                                danificar
                            </span> a máquina de lavar. Veja abaixo o local 
                            correto para cada um.

                            <br />
                            <br />

                            <span className="font-bold">Obs:</span> lembre-se que nessa 
                            máquina de lavar NÃO é permitido utilizar sabão em pó - ele 
                            danifica esse tipo de máquina.
                        </DialogDescription>

                        <figure className="flex flex-col items-center">
                            <Image
                                src="/modo_uso.png"
                                alt="Imagem dos compartimentos da máquina de lavar"
                                width={300}
                                height={300}
                            />

                            <figcaption
                                id={imageCaptionId}
                                className="sr-only"
                            >
                                Local correto para cada produto — detergente líquido 
                                no compartimento inferior direito, amaciante no 
                                compartimento superior esquerdo e &quot;tira manchas&quot; 
                                no compartimento inferior esquerdo.
                            </figcaption>
                        </figure>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </div>
    )
}