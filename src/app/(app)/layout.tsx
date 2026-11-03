import { AppSidebar } from "@/components/app-sidebar/app-sidebar";
import { LibraryProvider } from "@/components/library/library-context";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/** Every page except the editor and login: sidebar + content. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <LibraryProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SidebarProvider>
    </LibraryProvider>
  );
}
