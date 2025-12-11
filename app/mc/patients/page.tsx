/**
 * 患者一覧ページ（医療センター用）
 */

import { redirect } from 'next/navigation';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { McHeader } from '../components/McHeader';

export default async function McPatientsPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
    redirect('/mc/login');
  }

  const [medicalCenter, patients] = await Promise.all([
    prisma.medicalCenter.findUnique({
      where: { id: session.user.medicalCenterId },
    }),
    // この医療センターが登録した検査結果の患者を取得
    prisma.bloodTestResult.findMany({
      where: { medicalCenterId: session.user.medicalCenterId },
      select: {
        patient: {
          select: {
            id: true,
            name: true,
            email: true,
            dateOfBirth: true,
          },
        },
      },
      distinct: ['patientId'],
    }).then(results => results.map(r => r.patient)),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <McHeader
        staffName={session.user.name}
        centerName={medicalCenter?.name || ''}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">患者一覧</h1>

        <div className="rounded-lg bg-white shadow overflow-hidden">
          {patients.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-slate-600">患者が登録されていません</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    患者名
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    メールアドレス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                    生年月日
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-900">
                      {patient.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {patient.email}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                      {patient.dateOfBirth
                        ? format(new Date(patient.dateOfBirth), 'yyyy/MM/dd')
                        : '-'}
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
