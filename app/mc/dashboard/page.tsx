/**
 * 医療センターダッシュボード（SSR + Prisma）
 * 
 * 概要:
 *   医療センタースタッフ用のダッシュボード
 *   統計情報と最近のアップロード履歴を表示
 */

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { McHeader } from '../components/McHeader';

export default async function McDashboardPage() {
  const session = await auth();

  if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
    redirect('/mc/login');
  }

  // 統計情報を取得
  const [
    medicalCenter,
    totalResults,
    uniquePatients,
    recentUploads,
  ] = await Promise.all([
    // 医療機関情報
    prisma.medicalCenter.findUnique({
      where: { id: session.user.medicalCenterId },
    }),
    // 総検査結果数
    prisma.bloodTestResult.count({
      where: { medicalCenterId: session.user.medicalCenterId },
    }),
    // ユニーク患者数
    prisma.bloodTestResult.groupBy({
      by: ['patientId'],
      where: { medicalCenterId: session.user.medicalCenterId },
    }).then(r => r.length),
    // 最近のアップロード
    prisma.csvUploadLog.findMany({
      where: { medicalCenterId: session.user.medicalCenterId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
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
        {/* 統計カード */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-slate-500">総検査結果数</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{totalResults}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-slate-500">登録患者数</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{uniquePatients}</p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-sm font-medium text-slate-500">アップロード数</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{recentUploads.length}</p>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">クイックアクション</h2>
          <div className="flex gap-4">
            <Link
              href="/mc/results/upload"
              className="rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              CSVアップロード
            </Link>
            <Link
              href="/mc/patients"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              患者一覧
            </Link>
            <Link
              href="/mc/results"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              検査結果一覧
            </Link>
          </div>
        </div>

        {/* 最近のアップロード */}
        <div className="rounded-lg bg-white shadow">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900">最近のアップロード</h2>
          </div>

          {recentUploads.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <p className="text-slate-600">アップロード履歴がありません</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {recentUploads.map((upload) => (
                <li key={upload.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{upload.fileName}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {upload.medicalCenterStaff.name} •
                        {format(new Date(upload.createdAt), 'yyyy/MM/dd HH:mm')}
                      </p>
                    </div>
                    <div className="text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${upload.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : upload.status === 'FAILED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {upload.status === 'COMPLETED' ? '完了' :
                          upload.status === 'FAILED' ? '失敗' : '処理中'}
                      </span>
                      <span className="ml-2 text-slate-500">
                        {upload.successRows}/{upload.totalRows}件
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
