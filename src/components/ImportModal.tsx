'use client';

import { useState } from 'react';

interface ImportModalProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ImportModal({ onSuccess, onCancel }: ImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleImport = async () => {
        if (!file) {
            setError('Please select a CSV file');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const text = await file.text();
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            const leads = lines.slice(1).filter(line => line.trim()).map(line => {
                const values = line.split(',').map(v => v.trim());
                const lead: any = {};
                headers.forEach((header, index) => {
                    lead[header.toLowerCase()] = values[index];
                });
                return lead;
            });

            const res = await fetch('/api/leads/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leads }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Import failed');

            setResult(data.message);
            setTimeout(onSuccess, 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Import Leads from CSV</h2>
            <p className="text-sm text-gray-600 mb-6">
                Upload a CSV file with headers: <code className="bg-gray-100 p-1 rounded">name, email, phone, company, expected_value, notes</code>
            </p>

            <div className="space-y-4">
                <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />

                {error && <p className="text-red-500 text-sm">{error}</p>}
                {result && <p className="text-green-500 text-sm">{result}</p>}

                <div className="flex justify-end space-x-3 mt-8">
                    <button onClick={onCancel} className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleImport}
                        disabled={loading || !file}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Importing...' : 'Start Import'}
                    </button>
                </div>
            </div>
        </div>
    );
}
