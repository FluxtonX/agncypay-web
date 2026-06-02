import Image from "next/image";
import { cn } from "../../lib/utils";

type AgncyPayLogoProps = {
  className?: string;
  imageClassName?: string;
};

export function AgncyPayLogo({ className, imageClassName }: AgncyPayLogoProps) {
  return (
    <div className={cn("inline-flex items-center justify-center overflow-hidden", className)}>
      <Image
        src="/agncypayLogo.png"
        alt="AgncyPay"
        width={1430}
        height={580}
        priority
        className={cn("block object-contain object-left", imageClassName)}
      />
    </div>
  );
}
