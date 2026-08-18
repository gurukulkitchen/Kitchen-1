'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, ArrowRight, Loader2, Download } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

export default function BulkUploadModal({ isOpen, onClose, type, category, onSuccess }) {
    const [file, setFile] = useState(null);
    const [step, setStep] = useState('upload'); // query -> upload -> preview -> uploading -> success
    const [previewData, setPreviewData] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [saveResult, setSaveResult] = useState(null);
    const searchParams = useSearchParams();

    const companyId = searchParams.get('companyId');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setUploadError(null);
            handlePreview(selectedFile);
        }
    };

    const handlePreview = async (fileToProcess) => {
        const fileToUse = fileToProcess || file;
        if (!fileToUse) {
            setUploadError("Please select a file to upload.");
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        // Try to get companyId from URL, then from userData object, then from direct localStorage item
        const effectiveCompanyId = companyId || userData.companyId || userData.company || localStorage.getItem('companyId');

        if (!effectiveCompanyId) {
            setUploadError("Company ID not found. Please refresh the page or select a company.");
            return;
        }

        setIsProcessing(true);
        setUploadError(null);

        const formData = new FormData();
        formData.append('file', fileToUse);
        formData.append('type', type);
        formData.append('companyId', effectiveCompanyId);

        try {
            const res = await fetch('/api/kitchen/bulk-upload/preview', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();

            if (res.ok) {
                setPreviewData(data);
                setStep('preview');
            } else {
                setUploadError(data.error || 'Failed to parse file');
            }
        } catch (err) {
            setUploadError('Network error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSave = async () => {
        if (!previewData?.validRows?.length) return;
        setIsProcessing(true);

        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const effectiveCompanyId = companyId || userData.companyId || userData.company || localStorage.getItem('companyId');

        try {
            const res = await fetch('/api/kitchen/bulk-upload/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    rows: previewData.validRows,
                    type,
                    companyId: effectiveCompanyId,
                    userId: userData.id,
                    userName: userData.name
                })
            });

            const data = await res.json();
            if (res.ok) {
                setSaveResult(data);
                setStep('success');
                if (onSuccess) onSuccess();
            } else {
                setUploadError(data.error || 'Failed to save data');
            }
        } catch (err) {
            setUploadError('Failed to save data');
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadSample = () => {
        window.open(`/api/kitchen/bulk-upload/sample?type=${type}&category=${category}`, '_blank');
    };

    const reset = () => {
        setFile(null);
        setStep('upload');
        setPreviewData(null);
        setUploadError(null);
        setSaveResult(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-border"
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight flex items-center gap-2">
                        <FileSpreadsheet className="text-emerald-600" size={20} />
                        Bulk Upload {category} ({type === 'REGISTER' ? 'Register Items' : type})
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-muted-foreground/10 rounded-full text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-blue-700">Instructions</h4>
                                    <ul className="text-xs text-blue-600 mt-1 list-disc list-inside space-y-1">
                                        <li>Download the sample template first.</li>
                                        <li>Do not change column headers.</li>
                                        {type === 'REGISTER' ? (
                                            <>
                                                <li>Item Name and Category are required.</li>
                                                <li>Units should match existing system units (PCS, KG, etc).</li>
                                            </>
                                        ) : (
                                            <>
                                                <li>Date format should be YYYY-MM-DD.</li>
                                                {type === 'OUT' && <li>Ensure stock availability before uploading.</li>}
                                            </>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={downloadSample}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted-foreground/10 transition-colors"
                                >
                                    <Download size={16} /> Download Sample Template
                                </button>
                            </div>

                            <div className="border-2 border-dashed border-border rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-muted transition-colors cursor-pointer relative min-h-[200px]">
                                <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                    disabled={isProcessing}
                                />
                                {isProcessing ? (
                                    <div className="flex flex-col items-center gap-3">
                                        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
                                        <p className="text-sm font-bold text-foreground">Processing your file...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                            <Upload size={32} />
                                        </div>
                                        <p className="text-sm font-bold text-foreground">
                                            {file ? file.name : "Click to select Excel file"}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">.xlsx or .xls files only</p>
                                    </>
                                )}
                            </div>

                            {uploadError && (
                                <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg flex items-center gap-2">
                                    <AlertCircle size={16} /> {uploadError}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'preview' && previewData && (
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-black text-emerald-600">{previewData.validRows.length}</div>
                                    <div className="text-xs font-bold text-emerald-700 uppercase">Valid Rows</div>
                                </div>
                                <div className="flex-1 bg-red-50 border border-red-100 p-4 rounded-xl text-center">
                                    <div className="text-2xl font-black text-red-600">{previewData.errors.length}</div>
                                    <div className="text-xs font-bold text-red-700 uppercase">Errors</div>
                                </div>
                            </div>

                            {previewData.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 max-h-40 overflow-y-auto">
                                    <h4 className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                                        <AlertCircle size={14} /> Issues Found
                                    </h4>
                                    <ul className="space-y-1">
                                        {previewData.errors.map((err, i) => (
                                            <li key={i} className="text-xs text-red-600 font-medium">• {err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {previewData.validRows.length > 0 && (
                                <div className="border border-border rounded-xl overflow-hidden">
                                    <div className="px-4 py-2 bg-muted border-b border-border font-bold text-xs text-muted-foreground uppercase">
                                        Preview Valid Data ({previewData.validRows.length} rows)
                                    </div>
                                    <div className="max-h-[450px] overflow-y-auto shadow-inner bg-card">
                                        <table className="w-full text-sm text-left sticky-header">
                                            <thead className="bg-card text-muted-foreground sticky top-0 shadow-sm z-10">
                                                <tr>
                                                    {type === 'REGISTER' ? (
                                                        <>
                                                            <th className="px-4 py-2 font-semibold bg-card">Item Name</th>
                                                            <th className="px-4 py-2 font-semibold bg-card">Category</th>
                                                            <th className="px-4 py-2 font-semibold bg-card">Unit</th>
                                                            <th className="px-4 py-2 font-semibold text-right bg-card">Low Alert</th>
                                                            <th className="px-4 py-2 font-semibold text-right bg-card">Crit. Alert</th>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <th className="px-4 py-2 font-semibold bg-card">Date</th>
                                                            <th className="px-4 py-2 font-semibold bg-card">Item</th>
                                                            <th className="px-4 py-2 font-semibold bg-card">Category</th>
                                                            <th className="px-4 py-2 font-semibold text-right bg-card">Qty</th>
                                                            {type === 'IN' && (
                                                                <>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">GST %</th>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">MRP</th>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">Rate</th>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">Amount</th>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">Grand Total</th>
                                                                    <th className="px-4 py-2 font-semibold bg-card">Narration</th>
                                                                </>
                                                            )}
                                                            {type === 'OUT' && (
                                                                <>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">Rate</th>
                                                                    <th className="px-4 py-2 font-semibold text-right bg-card">Amount</th>
                                                                    <th className="px-4 py-2 font-semibold bg-card">Dept</th>
                                                                    <th className="px-4 py-2 font-semibold bg-card">Narration</th>
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-border">
                                                {previewData.validRows.map((row, i) => (
                                                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                        {type === 'REGISTER' ? (
                                                            <>
                                                                <td className="px-4 py-2 font-medium text-foreground">{row.name}</td>
                                                                <td className="px-4 py-2 text-muted-foreground text-xs uppercase">{row.category}</td>
                                                                <td className="px-4 py-2 text-foreground/80">{row.unit}</td>
                                                                <td className="px-4 py-2 text-right">{row.alertLow}</td>
                                                                <td className="px-4 py-2 text-right">{row.alertCritical}</td>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <td className="px-4 py-2 text-foreground/80 whitespace-nowrap">{new Date(row.date).toLocaleDateString()}</td>
                                                                <td className="px-4 py-2 font-medium text-foreground">{row.itemName}</td>
                                                                <td className="px-4 py-2 text-muted-foreground text-xs uppercase">{row.category}</td>
                                                                <td className="px-4 py-2 text-right font-bold">{row.quantity}</td>
                                                                {type === 'IN' && (
                                                                    <>
                                                                        <td className="px-4 py-2 text-right text-xs">{row.gstRate}%</td>
                                                                        <td className="px-4 py-2 text-right text-xs">₹{row.mrp}</td>
                                                                        <td className="px-4 py-2 text-right text-xs">₹{row.rate}</td>
                                                                        <td className="px-4 py-2 text-right font-medium text-blue-600">₹{row.totalAmount}</td>
                                                                        <td className="px-4 py-2 text-right font-bold text-green-600">₹{row.grandTotal}</td>
                                                                        <td className="px-4 py-2 text-xs">{row.narration || '-'}</td>
                                                                    </>
                                                                )}
                                                                {type === 'OUT' && (
                                                                    <>
                                                                        <td className="px-4 py-2 text-right">₹{row.rate}</td>
                                                                        <td className="px-4 py-2 text-right font-medium text-blue-600">₹{row.totalAmount}</td>
                                                                        <td className="px-4 py-2">{row.department}</td>
                                                                        <td className="px-4 py-2">{row.narration || '-'}</td>
                                                                    </>
                                                                )}
                                                            </>
                                                        )}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-in zoom-in duration-300">
                                <CheckCircle size={40} />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-foreground">Upload Successful!</h3>
                                <p className="text-muted-foreground mt-1 text-sm">{saveResult?.message}</p>
                            </div>
                            {saveResult?.errors?.length > 0 && (
                                <div className="w-full max-w-md bg-amber-50 border border-amber-100 rounded-xl p-4 mt-4 text-left">
                                    <p className="text-xs font-bold text-amber-700 mb-2">Some rows failed during save:</p>
                                    <ul className="list-disc list-inside text-xs text-amber-600 space-y-1">
                                        {saveResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-border bg-muted flex justify-end gap-3">


                    {step === 'preview' && (
                        <>
                            <button
                                onClick={reset}
                                className="px-4 py-2.5 text-muted-foreground font-bold text-sm hover:text-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isProcessing || previewData?.validRows?.length === 0}
                                className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 disabled: disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : <CheckCircle size={16} />}
                                Confirm & Save
                            </button>
                        </>
                    )}

                    {step === 'success' && (
                        <button
                            onClick={() => { onClose(); reset(); if (onSuccess) onSuccess(); }}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800"
                        >
                            Close
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
