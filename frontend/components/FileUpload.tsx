"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { Upload, X, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function FileUpload({ onUploadSuccess }: { onUploadSuccess: (doc: any) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            if (selectedFile.type !== "application/pdf") {
                setError("Only PDF files are supported currently.");
                return;
            }
            setFile(selectedFile);
            setError("");
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/documents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            setSuccess(true);
            onUploadSuccess(response.data);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Upload failed. Check your connection.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="glass rounded-xl p-8 shadow-sm">
            <div
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer
          ${file
                        ? "border-primary-400 bg-primary-50/30 dark:border-primary-600 dark:bg-primary-900/10"
                        : "border-slate-300 hover:border-primary-400 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
                    }`}
            >
                <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf"
                />

                {file ? (
                    <div className="flex flex-col items-center">
                        <div className="rounded-full bg-primary-100 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
                            <FileText className="h-8 w-8" />
                        </div>
                        <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{file.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                            onClick={(e) => { e.stopPropagation(); setFile(null); }}
                            className="mt-4 flex items-center text-xs font-medium text-red-500 hover:text-red-600"
                        >
                            <X className="mr-1 h-3 w-3" /> Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="rounded-full bg-slate-100 p-3 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            <Upload className="h-8 w-8" />
                        </div>
                        <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">Click to upload or drag and drop</p>
                        <p className="mt-1 text-xs text-slate-500">PDF (MAX. 10MB)</p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col items-center space-y-4">
                {file && !uploading && !success && (
                    <button
                        onClick={handleUpload}
                        className="w-full max-w-xs rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none"
                    >
                        Process Document
                    </button>
                )}

                {uploading && (
                    <div className="flex items-center text-sm font-medium text-primary-600">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing and Vectorizing...
                    </div>
                )}

                {success && (
                    <div className="flex items-center text-sm font-medium text-green-600">
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Successfully processed!
                    </div>
                )}

                {error && (
                    <div className="flex items-center text-sm font-medium text-red-500">
                        <AlertCircle className="mr-2 h-4 w-4" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
