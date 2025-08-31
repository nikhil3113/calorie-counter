import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-neutral-200/50 dark:bg-neutral-800/60 border border-neutral-200/70 dark:border-neutral-700/60",
        className
      )}
      {...props}
    />
  );
}
