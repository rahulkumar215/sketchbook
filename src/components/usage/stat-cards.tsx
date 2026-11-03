import {
  Folder,
  Image as ImageIcon,
  PenLine,
  Tag,
  type LucideIcon,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { UsageData } from "@/lib/types";

const STATS: {
  key: keyof UsageData["counts"];
  label: string;
  icon: LucideIcon;
}[] = [
  { key: "drawings", label: "Drawings", icon: PenLine },
  { key: "images", label: "Images", icon: ImageIcon },
  { key: "folders", label: "Folders", icon: Folder },
  { key: "tags", label: "Tags", icon: Tag },
];

/** KPI row: how many of each thing you have. */
export function StatCards({ counts }: { counts: UsageData["counts"] }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {STATS.map(({ key, label, icon: Icon }) => (
        <Card key={key} size="sm">
          <CardHeader>
            <CardDescription>{label}</CardDescription>
            <CardTitle className="text-xl tabular-nums">
              {counts[key].toLocaleString()}
            </CardTitle>
            <CardAction>
              <Icon className="text-muted-foreground" />
            </CardAction>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
