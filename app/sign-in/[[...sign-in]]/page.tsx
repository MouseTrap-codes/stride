"use client";

import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-stride-bg px-4">
      <SignIn 
        appearance={{
            variables: {
                colorPrimary: "var(--color-stride-blue)",
            },
        }}
        />
    </div>
  );
}
