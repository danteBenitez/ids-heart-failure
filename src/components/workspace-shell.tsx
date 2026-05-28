"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ActivitySquare,
  ChevronRight,
  HeartPulse,
  LayoutDashboard,
  PlusCircle,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getPalette } from "@/lib/demo-data";
import { cn } from "@/lib/utils";
import { Suspense } from "react";

type WorkspaceShellProps = {
  children: React.ReactNode;
};

const navigation = [
  {
    title: "Enfermería",
    href: "/dashboard/nursing",
    icon: UserRoundPlus,
    items: [{ title: "Nuevo paciente", href: "/dashboard/nursing/new" }],
  },
  {
    title: "Médico clínico",
    href: "/dashboard/clinical",
    icon: Stethoscope,
  },
  {
    title: "Cardiología",
    href: "/dashboard/cardiology",
    icon: HeartPulse,
  },
];

export function WorkspaceShell({ children }: WorkspaceShellProps) {
  return <Suspense><WorkspaceShellInner>{children}</WorkspaceShellInner></Suspense>
}

export function WorkspaceShellInner({ children }: WorkspaceShellProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const paletteId = searchParams.get("palette") ?? "sand";
  const guide = searchParams.get("guide") ?? "on";
  const palette = getPalette(paletteId);

  function withParams(href: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("palette", paletteId);
    params.set("guide", guide);
    return `${href}?${params.toString()}`;
  }

  return (
    <SidebarProvider
      className={cn(palette.className, "min-h-screen bg-background text-foreground")}
    >
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/60 p-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
              <ActivitySquare className="size-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">CardioFlow</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Flujo clínico por rol
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                        <Link href={withParams(item.href)}>
                          <Icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      {item.items ? (
                        <SidebarMenuSub>
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.href}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.href}
                              >
                                <Link href={withParams(subItem.href)}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel>Atajos</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Dashboard">
                    <Link href={withParams("/dashboard")}>
                      <LayoutDashboard />
                      <span>Tablero</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Inicio">
                    <Link href={withParams("/dashboard")}>
                      <ChevronRight />
                      <span>Resumen</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <div className="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/50 p-3 group-data-[collapsible=icon]:hidden">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-sidebar-foreground/70">
                Estado
              </p>
              <Badge variant="secondary">{guide === "on" ? "Guiada" : "Libre"}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-sidebar-foreground/80">
              Cada rol entra por su propia bandeja y luego accede al mismo caso con
              acciones diferentes.
            </p>
            <Button asChild size="sm" className="mt-3 w-full justify-between">
              <Link href={withParams("/dashboard/nursing/new")}>
                Nuevo paciente
                <PlusCircle data-icon="inline-end" />
              </Link>
            </Button>
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/88 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  App operativa
                </p>
                <p className="text-sm font-medium">
                  Bandejas por rol + detalle compartido del caso
                </p>
              </div>
            </div>
            <Badge variant="outline">{palette.name}</Badge>
          </div>
        </header>
        <div className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
