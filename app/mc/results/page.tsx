/**
 * 検査結果一覧ページ（医療センター用）
 */

import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { McHeader } from '../components/McHeader';

export default async function McResultsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
    redirect('/mc/login');
  }

  const [medicalCenter, results] = await Promise.all([
    prisma.medicalCenter.findUnique({
      where: { id: session.user.medicalCenterId },
    }),
    prisma.bloodTestResult.findMany({
      where: { medicalCenterId: session.user.medicalCenterId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        patient: {
          select: { name: true, email: true },
        },
        medicalCenterStaff: {
          select: { name: true },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <McHeader
        staffName={session.user.name}
        centerName={medicalCenter?.name || ''}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">検査結果一覧</h1>

        <div className="rounded-lg bg-white shadow overflow-hidden">
          {results.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-slate-600">検査結果がありません</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    患者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    検査日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    項目数
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    登録者
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    登録日時
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {result.patient.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {format(new Date(result.testDate), 'yyyy/MM/dd')}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {Object.keys(result.testItems as object).length}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {result.medicalCenterStaff?.name || '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {format(new Date(result.createdAt), 'yyyy/MM/dd HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
