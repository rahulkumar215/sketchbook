"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { NavAccount } from "./nav-account";
import { NavFolders } from "./nav-folders";
import { NavMain } from "./nav-main";
import { StorageMeter } from "./storage-meter";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <Image
                  src="/logo.png"
                  alt=""
                  width={32}
                  height={32}
                  unoptimized
                  className="size-8 shrink-0"
                />
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold">Sketchbook</span>
                  <span className="text-xs text-muted-foreground">
                    Personal notes
                  </span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Only the nav reads ?folder= from the URL, so only it suspends.
            Keeping <Sidebar> itself outside the boundary lets its
            desktop/phone switch hydrate with the provider (a boundary
            around the whole sidebar caused a hydration mismatch on phones). */}
        <Suspense fallback={<NavSkeleton />}>
          <NavMain />
          <SidebarSeparator />
          <NavFolders />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>
        <StorageMeter />
        <NavAccount />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function NavSkeleton() {
  return (
    <SidebarMenu className="p-2">
      {Array.from({ length: 4 }, (_, i) => (
        <SidebarMenuItem key={i}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
