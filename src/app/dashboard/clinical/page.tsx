import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ClinicalPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/70 bg-card/90">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Ruta: `/dashboard/clinical`</Badge>
            <Badge variant="outline">Bandeja de rol</Badge>
          </div>
          <CardTitle className="text-3xl">Médico clínico</CardTitle>
          <CardDescription className="max-w-2xl text-sm leading-6">
            Esta bandeja recibirá casos con datos ya cargados y listos para
            evaluación. El siguiente paso es mostrar score, explicación y decisión de
            derivación.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-2xl border border-dashed border-border bg-background/60 p-6 text-sm leading-6 text-muted-foreground">
            Placeholder de la bandeja médica. Acá debería entrar un caso completo
            desde enfermería, pero todavía sin diagnóstico ni resolución final.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
