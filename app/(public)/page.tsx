"use client";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AwardIcon,
  BookOpenIcon,
  GlobeIcon,
  LucideIcon,
  TrendingUpIcon,
} from "lucide-react";
import Link from "next/link";

interface featuresContentProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

const featuresContent: featuresContentProps[] = [
  {
    title: "Interactive Courses",
    description:
      "Engage with multimedia-rich lessons, quizzes, and real-time feedback for a dynamic learning experience.",
    icon: BookOpenIcon,
  },
  {
    title: "Progress Tracking",
    description:
      "Monitor your learning journey with detailed analytics, milestones, and personalized insights.",
    icon: TrendingUpIcon,
  },
  {
    title: "Anytime, Anywhere Access",
    description:
      "Learn at your own pace with mobile-friendly access to high-quality content from any device.",
    icon: GlobeIcon,
  },
  {
    title: "Certification & Rewards",
    description:
      "Earn certificates and recognition for your achievements as you complete courses and modules.",
    icon: AwardIcon,
  },
];

export default function Home() {
  return (
    <>
      <section className="relative py-20">
        <div className="flex flex-col items-center text-center space-y-8">
          <Badge variant={"outline"}> The Future of Online Education</Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Unlock a Smarter Way to Learn
          </h1>
          <p className="max-w-[700px] text-muted-foreground md:text-xl">
            Explore interactive, modern learning tools with our advanced LMS.
            Access high-quality content anytime, anywhere.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link
              href={"/courses"}
              className={buttonVariants({
                size: "lg",
              })}
            >
              Explore Courses
            </Link>
            <Link
              href={"/login"}
              className={buttonVariants({
                size: "lg",
                variant: "outline",
              })}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuresContent.map((feature, index) => {
          return (
            <Card key={index} className="hover:shadow-lg">
              <CardHeader>
                <div className="mb-4">
                  <feature.icon className="size-8" />
                </div>
                <CardTitle className="">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {feature.description}
              </CardContent>
            </Card>
          );
        })}
      </section>
    </>
  );
}
