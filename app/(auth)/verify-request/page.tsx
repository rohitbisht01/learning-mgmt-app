"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { authClient } from "@/lib/auth-client";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

export default function VerifyRequest() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const [otp, setOtp] = useState("");
  const [emailPending, startEmailTransition] = useTransition();

  function verifyOtp() {
    startEmailTransition(async () => {
      await authClient.signIn.emailOtp({
        email: email,
        otp: otp,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email Verified");
            router.push("/");
          },
          onError: () => {
            toast.error("Error verifying email");
          },
        },
      });
    });
  }

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Please check your email</CardTitle>
        <CardDescription className="">
          We have sent a verification code to your email address. Please open
          the email and paste the code below.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <InputOTP
            value={otp}
            onChange={(value) => setOtp(value)}
            maxLength={6}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPGroup>
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          <p className="text-sm text-muted-foreground">
            Enter 6 digit code sent to your email.
          </p>
        </div>

        <Button
          onClick={verifyOtp}
          disabled={emailPending || otp.length !== 6}
          className="w-full"
        >
          {emailPending ? (
            <>
              <Loader className="animate-spin size-4" />{" "}
              <span>Loading...</span>{" "}
            </>
          ) : (
            <> Verify Request</>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
