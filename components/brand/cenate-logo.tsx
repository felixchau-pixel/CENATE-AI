import Image from "next/image";
import { cn } from "@/lib/utils";

type CenateLogoProps = {
  alt?: string;
  className?: string;
  priority?: boolean;
  variant?: "mark" | "wordmark" | "main-icon" | "collapsed-icon";
};

export function CenateLogo({
  alt = "Cenate",
  className,
  priority = false,
  variant = "wordmark",
}: CenateLogoProps) {
  if (variant === "main-icon") {
    return (
      <span className={cn("relative inline-flex h-8 w-8", className)}>
        <Image
          src="/icon.png"
          alt={alt}
          fill
          priority={priority}
          sizes="32px"
          className="object-contain"
        />
      </span>
    );
  }

  if (variant === "collapsed-icon") {
    return (
      <span className={cn("relative inline-flex h-8 w-8", className)}>
        <Image
          src="/Icons.png"
          alt={alt}
          fill
          priority={priority}
          sizes="32px"
          className="object-contain"
        />
      </span>
    );
  }

  if (variant === "mark") {
    return (
      <span className={cn("inline-flex h-7 w-7 overflow-hidden", className)}>
        <Image
          src="/Logo.png"
          alt={alt}
          width={112}
          height={28}
          priority={priority}
          className="h-full w-auto max-w-none"
        />
      </span>
    );
  }

  return (
    <span className={cn("relative inline-flex h-7 w-[112px]", className)}>
      <Image
        src="/Logo.png"
        alt={alt}
        fill
        priority={priority}
        sizes="112px"
        className="object-contain object-left"
      />
    </span>
  );
}
