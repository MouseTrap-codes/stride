import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
}

export function FeatureCard({ icon: Icon, title, description}: FeatureCardProps) {
    return (
    <Card className="bg-stride-surface border-zinc-800 hover:border-stride-blue/50 transition-all duration-300">
        <CardHeader className="space-y-4">
            {/* icon */}
            <div className="w-12 h-12 rounded-lg bg-stride-blue/10 flex items-center justify-center">
                <Icon className="w-6 h-6 text-stride-blue" />
            </div>

            {/* text */}
            <div className="space-y-2">
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription className="text-zinc-400 leading-relaxed">
                    {description}
                </CardDescription>
            </div>
        </CardHeader>
    </Card>
    )
}