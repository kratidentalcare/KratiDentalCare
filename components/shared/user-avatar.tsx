import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export type UserAvatarProps = {
  name: string;
  src?: string | null;
  size?: "sm" | "default" | "lg";
  className?: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[parts.length - 1]![0] ?? ""}`.toUpperCase();
}

/**
 * Person avatar with initials fallback for doctors, patients, and staff.
 */
export function UserAvatar({
  name,
  src,
  size = "default",
  className,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <Avatar size={size} className={cn(className)}>
      {src ? <AvatarImage src={src} alt={name} /> : null}
      <AvatarFallback aria-label={name}>{initials}</AvatarFallback>
    </Avatar>
  );
}
