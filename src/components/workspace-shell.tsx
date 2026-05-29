"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ActivitySquare,
  BrainCircuit,
  HeartPulse,
  LayoutDashboard,
  Stethoscope,
  UserRoundPlus,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
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
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";

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
  const guide = searchParams.get("guide") ?? "on";

  function withParams(href: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("guide", guide);
    return `${href}?${params.toString()}`;
  }

  return (
    <SidebarProvider className="min-h-screen bg-background text-foreground">
      <Sidebar variant="inset" collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-3 rounded-2xl">
            <div className="flex items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground aspect-square size-10">
              <ActivitySquare className="size-5" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">CardioFlow</p>
              <p className="truncate text-xs text-sidebar-foreground/70">
                Sistema de asistencia al diagnóstico
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarGroup>
          <SidebarGroupLabel>Administración</SidebarGroupLabel>
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
                <SidebarMenuButton asChild tooltip="Modelo">
                  <Link href={withParams("/dashboard/model")}>
                    <BrainCircuit />
                    <span>Modelo</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

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

        </SidebarContent>

      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 border-b border-border/70 bg-background/88 backdrop-blur">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  CardioFlow
                </p>
                <p className="text-sm font-medium">
                  Gestión clínica de casos
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 px-4 py-6 md:px-6 md:py-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
