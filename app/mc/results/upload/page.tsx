/**
 * CSVアップロードページ（医療センター用）
 */

import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { McHeader } from '../../components/McHeader';
import { CsvUploadForm } from './CsvUploadForm';

export default async function McUploadPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
    redirect('/mc/login');
  }

  const medicalCenter = await prisma.medicalCenter.findUnique({
    where: { id: session.user.medicalCenterId },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <McHeader
        staffName={session.user.name}
        centerName={medicalCenter?.name || ''}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">CSVアップロード</h1>

        <div className="rounded-lg bg-white p-6 shadow">
          <CsvUploadForm />

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-medium text-slate-900 mb-2">CSVフォーマット</h3>
            <p className="text-sm text-slate-600 mb-4">
              以下のカラムを含むCSVファイルをアップロードしてください：
            </p>
            <div className="bg-slate-50 rounded-md p-4 text-sm font-mono">
              患者メール,患者名,検査日,項目名,結果値,単位,基準値下限,基準値上限
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
