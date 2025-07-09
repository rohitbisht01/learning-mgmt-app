"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader, Send } from "lucide-react";
import React, { useState, useTransition } from "react";
import { GithubIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const [githubPending, startGithubTransition] = useTransition();
  const [emailPending, startEmailTransaction] = useTransition();
  const [email, setEmail] = useState("");

  async function signInWithGithub() {
    startGithubTransition(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed with Github");
          },
          onError: (error) => {
            // toast.error(error.error.message);
            toast.error("Internal Server Error");
          },
        },
      });
    });
  }

  function signInWithEmail() {
    startEmailTransaction(async () => {
      const { data, error } = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent");
            router.push(`/verify-request?email=${email}`);
          },
          onError: () => {
            toast.error("Error sending email");
          },
        },
      });
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Welcome Back</CardTitle>
        <CardDescription className="">
          Login with your Github/Email Account
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          onClick={signInWithGithub}
          className="w-full"
          variant={"outline"}
          disabled={githubPending}
        >
          {githubPending ? (
            <>
              <Loader className="animate-spin size-4" />{" "}
              <span>Loading...</span>{" "}
            </>
          ) : (
            <>
              <GithubIcon className="size-4" /> Sign in with Github
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="name@gmail.com"
            required
          />
        </div>
        <Button onClick={signInWithEmail} disabled={emailPending}>
          {emailPending ? (
            <>
              <Loader className="animate-spin size-4" />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <Send className="size-4" /> Continue with Email
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

export default LoginForm;
