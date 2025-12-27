"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-stride-bg px-4">
      <SignIn 
        appearance={{
            elements: {
                // card: "bg-zinc-900 border border-zinc-800 shadow-2xl",
                // formButtonPrimary:
                // "bg-stride-blue hover:bg-stride-blue-hover text-white font-medium",
            },
            variables: {
                colorPrimary: "var(--color-stride-blue)",
            },
        }}
        />
    </div>
  );
}
