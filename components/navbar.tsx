import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { LayoutDashboard, FolderKanban } from "lucide-react";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 border-b border-zinc-800 bg-stride-bg/95 backdrop-blur supports-[backdrop-filter]:bg-stride-bg/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* logo */}
                    <Link href="/" className="flex items-center">
                        <span className="text-2xl font-bold text-stride-blue">
                            Stride
                        </span>
                    </Link>

                    {/* navigation - signed in */}
                    <div className="flex items-center gap-4">
                        <SignedIn>
                            <Button variant="ghost" asChild className="text-zinc-400 hover:text-zinc-100">
                                <Link href="/projects" className="flex items-center gap-2">
                                    <FolderKanban className="w-4 h-4" />
                                    Projects
                                </Link>
                            </Button>
                            <Button variant="ghost" asChild className="text-zinc-400 hover:text-zinc-100">
                                <Link href="/dashboard" className="flex items-center gap-2">
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                            </Button>
                            <UserButton />
                        </SignedIn>

                        <SignedOut>
                            <SignInButton>
                                <Button variant="ghost">
                                    Sign In
                                </Button>
                            </SignInButton>

                            <SignUpButton>
                                <Button>
                                    Sign Up
                                </Button>
                            </SignUpButton>
                        </SignedOut>
                    </div>
                </div>
            </div>
        </nav>
    )
}