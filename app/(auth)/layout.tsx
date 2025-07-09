import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href={"/"}
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link className="text-3xl font-bold text-center" href={"/"}>
          {/* <Image src={""} alt="LearnForge" width={32} height={32} /> */}
          LearnForge
        </Link>
        {children}

        <div className="text-balance text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <span className="hover:underline hover:text-primary">
            Terms of service
          </span>{" "}
          and{" "}
          <span className="hover:underline hover:text-primary">
            Privacy Policy
          </span>
          .
        </div>
      </div>
    </div>
  );
}
