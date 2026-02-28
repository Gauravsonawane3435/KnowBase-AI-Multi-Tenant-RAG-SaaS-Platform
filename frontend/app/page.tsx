"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated()) {
            router.push("/dashboard");
        } else {
            router.push("/login");
        }
    }, [router]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                    KnowBase <span className="text-primary-500">AI</span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                    Redirecting you to your workspace...
                </p>
                <div className="mt-10 flex items-center justify-center gap-x-6">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                </div>
            </div>
        </div>
    );
}
