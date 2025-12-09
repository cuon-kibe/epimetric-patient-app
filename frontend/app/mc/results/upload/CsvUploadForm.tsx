/**
 * CSVアップロードフォームコンポーネント
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { uploadMedicalCenterCSV } from '@/app/actions/blood-test';

export function CsvUploadForm() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUploading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData(e.currentTarget);
            const result = await uploadMedicalCenterCSV(formData);

            if (result.success) {
                setSuccess('アップロードが完了しました');
                (e.target as HTMLFormElement).reset();
                router.refresh();
            } else {
                setError(result.error || 'アップロードに失敗しました');
            }
        } catch (err) {
            setError('アップロード中にエラーが発生しました');
        } finally {
            setUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{error}</p>
                </div>
            )}

            {success && (
                <div className="rounded-md bg-green-50 p-4">
                    <p className="text-sm text-green-800">{success}</p>
                </div>
            )}

            <div>
                <label htmlFor="file" className="block text-sm font-medium text-slate-700 mb-2">
                    CSVファイル
                </label>
                <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".csv"
                    required
                    disabled={uploading}
                    className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-slate-800 file:text-white
            hover:file:bg-slate-700
            disabled:opacity-50"
                />
            </div>

            <button
                type="submit"
                disabled={uploading}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50"
            >
                {uploading ? 'アップロード中...' : 'アップロード'}
            </button>
        </form>
    );
}

