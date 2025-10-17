import { toggleMachineType } from "@/lib/utils";
import { MachineEn } from "@/types";
import {
    Html,
    Head,
    Preview,
    Body,
    Container,
    Section,
    Text,
    Hr,
    Link,
} from "@react-email/components";

type ReservationConfirmedProps = {
    name: string;
    equipment: MachineEn;
    apartment_number: string;
    dateStr: string;
    timeStr: string;
    siteUrl?: string;
}

export default function ReservationConfirmed({
    name,
    equipment,
    apartment_number,
    dateStr,
    timeStr,
    siteUrl = "https://www.lavanderiadascorujas.com.br",
}: ReservationConfirmedProps) {
    const brandColor = "hsl(146, 47%, 65%)";

    const equipmentPtBR = toggleMachineType(equipment);

    return (
        <Html>
            <Head />
            <Preview>Sua reserva da {equipmentPtBR} foi confirmada</Preview>
            <Body
                style={{
                    fontFamily: "Arial, Helvetica, sans-serif",
                    backgroundColor: "#f6f8fb",
                    color: "#111827",
                    margin: 0,
                }}
            >
                <Container
                    style={{
                        maxWidth: 560,
                        margin: "0 auto",
                        backgroundColor: "#ffffff",
                        borderRadius: 12,
                        padding: 24,
                        border: "1px solid #e5e7eb",
                    }}
                >
                    <Section>
                        <Text
                            style={{
                                fontSize: 20,
                                fontWeight: 700,
                                margin: 0,
                                color: brandColor,
                            }}
                        >
                            Lavanderia das Corujas
                        </Text>

                        <Text style={{ marginTop: 4, color: "#6b7280" }}>
                            {siteUrl.replace(/^https?:\/\//, "")}
                        </Text>
                    </Section>

                    <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

                    <Section>
                        <Text style={{ fontSize: 16 }}>
                            Olá {name},
                        </Text>

                        <Text style={{ fontSize: 16, lineHeight: "24px" }}>
                            Sua reserva da <strong>{equipmentPtBR}</strong> foi 
                            confirmada para o apartamento 
                            <strong>{apartment_number}</strong> 
                            em <strong>{dateStr}</strong> às{" "} 
                            <strong>{timeStr}</strong>.
                        </Text>

                        <Text style={{ fontSize: 14, color: "#6b7280" }}>
                            Caso precise alterar ou cancelar, acesse o{" "}
                            <Link href={siteUrl}>sistema</Link>.
                        </Text>
                    </Section>

                    <Hr style={{ borderColor: "#e5e7eb", margin: "16px 0" }} />

                    <Section
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 12,
                        }}
                    >
                        <Text
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: "#6b7280",
                            }}
                        >
                            Lavanderia das Corujas
                        </Text>
                        {/* Placeholder para a imagem da coruja (se quiser inserir depois) */}
                        {/* <img src="https://placehold.co/80x40?text=Coruja" alt="Logo Coruja" /> */}
                    </Section>
                </Container>
            </Body>
        </Html>
    )
}