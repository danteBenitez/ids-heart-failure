import Link from "next/link";
import { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PatientCase, RoleKey } from "@/lib/types";

type CaseQueueTableProps = {
  title: string;
  description: string;
  cases: PatientCase[];
  role: RoleKey;
  guide: string;
  headerAction?: ReactNode;
  readOnly?: boolean;
};

export function CaseQueueTable({
  title,
  description,
  cases,
  role,
  guide,
  headerAction,
  readOnly = false,
}: CaseQueueTableProps) {
  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {headerAction}
      </CardHeader>
      <CardContent>
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background/80">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-4">Paciente</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Riesgo</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cases.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground pl-4">
                    <div className="flex flex-col items-center justify-center space-y-1.5 py-4">
                      <p className="font-medium text-foreground/80 text-sm">No hay pacientes en esta bandeja por el momento</p>
                      <p className="text-xs text-muted-foreground">Todos los casos han sido procesados o asignados a otros roles.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                cases.map((patientCase) => (
                  <TableRow key={patientCase.id}>
                    <TableCell className="pl-4 align-top">
                      <div className="space-y-1">
                        <p className="font-medium">{patientCase.patient.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {patientCase.patient.recordNumber}
                        </p>
                        <p className="max-w-md text-sm leading-6 text-muted-foreground whitespace-normal">
                          {patientCase.assessment.clinicalSummary}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patientCase.patient.location}
                    </TableCell>
                    <TableCell>{patientCase.modelInput.age}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
                        <Badge variant="outline">{patientCase.workflow.status}</Badge>
                        {readOnly && (
                          <Badge variant="secondary" className="w-fit text-[10px] uppercase tracking-wider font-semibold bg-muted text-muted-foreground border-dashed">
                            Solo lectura
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          patientCase.assessment.riskLevel === "Alto" ? "default" : "secondary"
                        }
                      >
                        Riesgo {patientCase.assessment.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/cases/${patientCase.id}?guide=${guide}&role=${role}${readOnly ? "&readonly=true" : ""}`}>
                          {readOnly ? "Ver caso" : "Abrir caso"}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
