import type { Metadata } from "next";
import { Recursive } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const recursive = Recursive({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnForge | Powerful LMS for Online Learning",
  description:
    "LearnForge is a modern Learning Management System (LMS) for schools, businesses, and creators to launch and manage engaging online courses.",
  keywords: [
    "LMS",
    "Learning Management System",
    "Online Courses",
    "E-learning",
    "Course Platform",
    "Skill Development",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={recursive.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
