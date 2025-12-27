import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { User } from "lucide-react";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-stride-g/95 backdrop-blur supports-[backdrop-filter]:bg-stride-bg/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-stride-blue">
                            Stride
                        </span>
                    </Link>

                    {/* navigation */}
                    {/* <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link href="/signin">Sign In</Link>
                        </Button>
                        <Button asChild>
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                        
                    </div> */}

                    {/* with clerk auth */}
                    <div className="flex items-center gap-4">
                        <SignedOut>
                            <SignInButton>
                                <Button variant="ghost" asChild>
                                    <Link href="/sign-in">Sign In</Link>
                                </Button>
                            </SignInButton>

                            <SignUpButton>
                                <Button asChild>
                                    <Link href="/sign-up">Sign Up</Link>
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                       <SignedIn>
                            <span className="text-sm text-zinc-400">Signed in</span>
                            <UserButton />
                       </SignedIn>
                    </div>
                </div>
            </div>

        </nav>
    )
}