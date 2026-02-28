"use client";

import FileUpload from "@/components/FileUpload";
import { FileText, Clock, Trash2, ExternalLink, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";

export default function UploadPage() {
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const response = await api.get("/documents/");
            setDocs(response.data);
        } catch (err) {
            setError("Failed to fetch documents.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const onUploadSuccess = (newDoc: any) => {
        setDocs([newDoc, ...docs]);
    };

    const handleDelete = async (docId: string) => {
        if (!confirm("Are you sure you want to delete this document and all its embeddings? This action cannot be undone.")) return;

        try {
            await api.delete(`/documents/${docId}`);
            setDocs(docs.filter(d => d.id !== docId));
        } catch (err) {
            alert("Failed to delete document.");
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Knowledge Source</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Upload PDF documents to expand your RAG knowledge base. Chunks and embeddings will be generated automatically.
                </p>
            </div>

            <FileUpload onUploadSuccess={onUploadSuccess} />

            <div className="glass rounded-xl shadow-sm overflow-hidden">
                <div className="border-b border-slate-200 bg-white/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Uploaded Documents</h3>
                    {loading && <Loader2 className="h-4 w-4 animate-spin text-primary-500" />}
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {loading && docs.length === 0 ? (
                        <div className="p-10 text-center flex flex-col items-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
                            <p className="text-slate-500 text-sm">Loading documents...</p>
                        </div>
                    ) : docs.length === 0 ? (
                        <div className="p-10 text-center text-slate-500">
                            No documents uploaded yet.
                        </div>
                    ) : (
                        docs.map((doc) => (
                            <div key={doc.id} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <div className="flex items-center">
                                    <div className="rounded-lg bg-red-100 p-2 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.filename || "document.pdf"}</p>
                                        <div className="flex items-center mt-1 text-xs text-slate-500">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'Date unknown'}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-x-2">
                                    <button
                                        onClick={() => handleDelete(doc.id)}
                                        className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                                        title="Delete Document"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {error && (
                <div className="flex items-center justify-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 text-sm">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {error}
                </div>
            )}
        </div>
    );
}
