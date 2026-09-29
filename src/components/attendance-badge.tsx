import { CircleCheck, CircleX } from "lucide-react";
import { ATTENDANCE_LABEL, type Attendance } from "@/lib/types";

export function AttendanceBadge({ attendance, pax }: { attendance: Attendance; pax?: number }) {
  const hadir = attendance === "hadir";
  const Icon = hadir ? CircleCheck : CircleX;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ${
        hadir ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-red-50 text-red-600 ring-red-200"
      }`}
    >
      <Icon className="size-3.5" />
      {ATTENDANCE_LABEL[attendance]}
      {hadir && pax ? ` · ${pax}` : ""}
    </span>
  );
}
