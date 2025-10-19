import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type SessionProps = {
  displayName: string | null;
  pictureUrl?: string | null;
};

type TextProps = {
  text: string;
};

type ProfileAvatarProps = (SessionProps | TextProps) & {
  className?: string;
  fallbackClassName?: string;
};

export function ProfileAvatar(props: ProfileAvatarProps) {
  const avatarClassName = cn(
    "relative flex shrink-0 overflow-hidden rounded-full mx-auto size-9 group-focus:ring-2",
    props.className
  );

  const fallbackClassName = cn(
    "bg-muted flex size-full items-center justify-center rounded-full animate-in fade-in",
    props.fallbackClassName
  );

  // When you just pass text instead of session info
  if ("text" in props) {
    return (
      <Avatar className={avatarClassName}>
        <AvatarFallback className={fallbackClassName}>
          <span className="font-semibold uppercase">
            {props.text.slice(0, 1)}
          </span>
        </AvatarFallback>
      </Avatar>
    );
  }

  const initials = props.displayName?.slice(0, 1)?.toUpperCase() ?? "?";

  return (
    <Avatar className={avatarClassName}>
      <AvatarImage src={props.pictureUrl ?? undefined} />
      <AvatarFallback className={fallbackClassName}>
        <span suppressHydrationWarning className="font-semibold uppercase">
          {initials}
        </span>
      </AvatarFallback>
    </Avatar>
  );
}
