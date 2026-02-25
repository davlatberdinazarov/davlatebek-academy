import { cn } from "@/lib/utils";

type ProgressProps = {
  value: number;
  className?: string;
};

export function Progress({ value, className }: ProgressProps) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-white/10 shadow-inner", className)}>
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 shadow-[0_0_20px_rgba(76,116,255,0.5)] transition-all duration-300"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}
