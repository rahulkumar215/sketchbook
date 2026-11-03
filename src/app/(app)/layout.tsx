import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { LibraryProvider } from "@/components/library/library-context";
import { LibraryDndProvider } from "@/components/library/library-dnd";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** Every page except the editor and login: sidebar + content. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <LibraryProvider>
      {/* one drag context: cards in the page drop onto sidebar folders */}
      <LibraryDndProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </LibraryDndProvider>
    </LibraryProvider>
  );
}
