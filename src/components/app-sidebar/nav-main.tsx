"use client";

import {
  ChartPie,
  Images,
  Inbox,
  Layers,
  Shapes,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLibrary } from "@/components/library/library-context";
import { useFolderDrop } from "@/components/library/use-folder-drop";
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

/**
 * "All drawings" / "Unfiled". Dropping a drawing on Unfiled takes it out of
 * its folder; folders go to the top level via the zone under the folders.
 */
function RootItem({ selection, label, icon: Icon, count }: RootItemProps) {
  const { setOpenMobile } = useSidebar();
  const active = useIsSelected(selection);
  const { ref: dropRef, isDropTarget } = useFolderDrop({
    id: `root:${selection}`,
    folderId: null,
    only: "drawing",
    disabled: selection !== UNFILED,
  });

  return (
    <SidebarMenuItem ref={dropRef}>
      <SidebarMenuButton
        asChild
        isActive={active}
        className={cn(
          isDropTarget && "bg-sidebar-accent ring-2 ring-sidebar-ring",
        )}
      >
        <Link
          href={selectionHref(selection)}
          draggable={false}
          onClick={() => setOpenMobile(false)}
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
            <SidebarMenuButton
              asChild
              isActive={pathname === "/shape-libraries"}
            >
              <Link
                href="/shape-libraries"
                onClick={() => setOpenMobile(false)}
              >
                <Shapes />
                <span>Shape libraries</span>
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
