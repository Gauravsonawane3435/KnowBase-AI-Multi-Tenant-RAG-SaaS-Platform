import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
    title: "KnowBase AI | Multi-Tenant RAG Platform",
    description: "Secure, scalable AI-powered knowledge base for multi-tenant organizations.",
};

import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/lib/ThemeContext";
import { UIProvider } from "@/lib/UIContext";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased overflow-x-hidden">
                <ThemeProvider>
                    <UIProvider>
                        <AuthProvider>
                            {children}
                        </AuthProvider>
                    </UIProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
