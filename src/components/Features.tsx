"use client";

import { BarChart3, Shield, Globe, Users, Zap, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const features = [
    {
        title: "Real-time Tracking",
        description: "Monitor every trade and transaction as it happens with our low-latency infrastructure.",
        icon: <Zap className="h-6 w-6 text-emerald-400" />,
    },
    {
        title: "Secure by Design",
        description: "Enterprise-grade encryption and role-based access control to keep your data safe.",
        icon: <Shield className="h-6 w-6 text-emerald-400" />,
    },
    {
        title: "Global Reach",
        description: "Connect with markets around the world through our distributed network.",
        icon: <Globe className="h-6 w-6 text-emerald-400" />,
    },
    {
        title: "Advanced Analytics",
        description: "Get deep insights into your business performance with automated reporting.",
        icon: <BarChart3 className="h-6 w-6 text-emerald-400" />,
    },
    {
        title: "Team Collaboration",
        description: "Seamlessly manage personnel and permissions across your entire organization.",
        icon: <Users className="h-6 w-6 text-emerald-400" />,
    },
    {
        title: "24/7 Availability",
        description: "Our platform is always on, ensuring you never miss a critical trade window.",
        icon: <Clock className="h-6 w-6 text-emerald-400" />,
    },
];

export function Features() {
    return (
        <section id="features" className="py-24 sm:py-32 bg-transparent">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-500">
                    Powerful Features
                </h2>
                <p className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    Everything you need to scale your trade.
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400">
                    Built for speed, reliability, and ease of use. Focus on your growth while we handle the complexities of your business infrastructure.
                </p>

                <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature, i) => (
                        <Card key={i} className="border-white/5 bg-white/5 backdrop-blur-sm transition-all hover:bg-white/10 hover:border-emerald-500/50 hover:-translate-y-1">
                            <CardHeader className="pb-4">
                                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                                    {feature.icon}
                                </div>
                                <CardTitle className="text-white text-xl">{feature.title}</CardTitle>
                                <CardDescription className="text-zinc-400 mt-2">
                                    {feature.description}
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
