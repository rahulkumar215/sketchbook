import { EditorLoader } from "@/components/editor/EditorLoader";

export default async function DrawingPage({ params }: PageProps<"/d/[id]">) {
  const { id } = await params;
  return <EditorLoader id={id} />;
}
