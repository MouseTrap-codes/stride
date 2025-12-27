"use client";

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stride-bg px-4">
      <SignUp 
        appearance={{
                elements: {
                    formButtonPrimary:
                    "bg-stride-blue hover:bg-stride-blue-hover text-white font-medium",
                },
                variables: {
                    colorPrimary: "var(--color-stride-blue)",
                },
            }}
        />
    </div>
  );
}
