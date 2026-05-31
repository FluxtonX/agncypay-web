import Image from "next/image";
import { cn } from "../../lib/utils";

type AgncyPayLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function AgncyPayLogo({ className, imageClassName }: AgncyPayLogoProps) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <Image
        src="/agncypayLogo.png"
        alt="AgncyPay"
        width={260}
        height={68}
        priority
        className={cn("h-auto w-auto object-contain object-left", imageClassName)}
      />
    </div>
  );
}
