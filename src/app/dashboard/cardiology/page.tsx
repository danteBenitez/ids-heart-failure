import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CardiologyPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Bandeja de rol</Badge>
          </div>
          <CardTitle className="text-3xl">Cardiología</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Esta bandeja recibirá casos derivados, con score y contexto clínico casi
            completo. El trabajo del rol es confirmar, corregir o cerrar el caso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-sm leading-6 text-muted-foreground">
            Placeholder de la bandeja de cardiología. Cuando avancemos, va a abrir el
            mismo detalle de caso, pero con acciones y resolución clínica final.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
