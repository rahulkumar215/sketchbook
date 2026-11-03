"use client";

import { ChartPie, Images, Inbox, Layers, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useDropTarget } from "./use-drop-target";
import { useLibraryActions } from "@/components/library/library-actions";
import { useLibrary } from "@/components/library/library-context";
import {
  selectionHref,
  useIsSelected,
} from "@/components/library/use-selection";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { ALL, UNFILED } from "@/lib/library-filter";

type RootItemProps = {
  selection: string;
  label: string;
  icon: LucideIcon;
  count: number;
};

/** "All drawings" / "Unfiled". Dropping here moves things to the top level. */
function RootItem({ selection, label, icon: Icon, count }: RootItemProps) {
  const { moveItem } = useLibraryActions();
  const { setOpenMobile } = useSidebar();
  const active = useIsSelected(selection);
  const drop = useDropTarget((item) => void moveItem(item, null));

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={cn(drop.dropping && "ring-2 ring-sidebar-ring")}
      >
        <Link
          href={selectionHref(selection)}
          onClick={() => setOpenMobile(false)}
          {...drop.handlers}
        >
          <Icon />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuBadge>{count}</SidebarMenuBadge>
    </SidebarMenuItem>
  );
}

export function NavMain() {
  const { drawings } = useLibrary();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <RootItem
            selection={ALL}
            label="All drawings"
            icon={Layers}
            count={drawings.length}
          />
          <RootItem
            selection={UNFILED}
            label="Unfiled"
            icon={Inbox}
            count={drawings.filter((d) => !d.folderId).length}
          />
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/images"}>
              <Link href="/images" onClick={() => setOpenMobile(false)}>
                <Images />
                <span>Images</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/usage"}>
              <Link href="/usage" onClick={() => setOpenMobile(false)}>
                <ChartPie />
                <span>Storage &amp; usage</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
