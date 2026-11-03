import { Suspense } from "react";
import { LibraryPage } from "@/components/library/library-page";

export default function HomePage() {
  return (
    <Suspense>
      <LibraryPage />
    </Suspense>
  );
}
