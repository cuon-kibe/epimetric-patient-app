/**
 * 血液検査結果 Server Actions
 * 
 * 概要:
 *   血液検査結果のCRUD操作を行うServer Actions
 *   CSVアップロードもここで処理
 * 
 * 使用例:
 *   import { uploadBloodTestResult, getBloodTestResults } from '@/app/actions/blood-test';
 */

'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parse } from 'csv-parse/sync';
import { revalidatePath } from 'next/cache';

// ============================================================
// 型定義
// ============================================================

interface TestItemValue {
    value: string;
    unit?: string;
    reference_min?: string;
    reference_max?: string;
}

interface BloodTestResultWithCount {
    id: number;
    testDate: Date;
    createdAt: Date;
    itemsCount: number;
}

// ============================================================
// 患者用アクション
// ============================================================

/**
 * 患者の血液検査結果一覧を取得
 * 
 * @returns 検査結果一覧
 */
export async function getPatientBloodTestResults(): Promise<BloodTestResultWithCount[]> {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'patient') {
        throw new Error('認証が必要です');
    }

    const results = await prisma.bloodTestResult.findMany({
        where: { patientId: parseInt(session.user.id) },
        orderBy: { testDate: 'desc' },
        select: {
            id: true,
            testDate: true,
            testItems: true,
            createdAt: true,
        },
    });

    return results.map(result => ({
        id: result.id,
        testDate: result.testDate,
        createdAt: result.createdAt,
        itemsCount: Object.keys(result.testItems as object).length,
    }));
}

/**
 * 血液検査結果詳細を取得
 * 
 * @param id 検査結果ID
 * @returns 検査結果詳細
 */
export async function getBloodTestResultDetail(id: number) {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'patient') {
        throw new Error('認証が必要です');
    }

    const result = await prisma.bloodTestResult.findFirst({
        where: {
            id,
            patientId: parseInt(session.user.id),
        },
    });

    if (!result) {
        throw new Error('検査結果が見つかりません');
    }

    return {
        id: result.id,
        testDate: result.testDate,
        testItems: result.testItems as Record<string, TestItemValue>,
        notes: result.notes,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
    };
}

/**
 * 患者がCSVをアップロードして検査結果を登録
 * 
 * @param formData フォームデータ（file, testDate）
 * @returns 登録結果
 */
export async function uploadPatientBloodTestResult(
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'patient') {
        return { success: false, error: '認証が必要です' };
    }

    const file = formData.get('file') as File;
    const testDateStr = formData.get('testDate') as string;

    if (!file) {
        return { success: false, error: 'ファイルを選択してください' };
    }

    try {
        // CSVを読み込み
        const text = await file.text();
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        // テストアイテムを構築
        const testItems: Record<string, TestItemValue> = {};

        for (const record of records) {
            const itemName = record['項目名'] || record['item_name'] || record['name'];
            if (!itemName) continue;

            testItems[itemName] = {
                value: record['結果値'] || record['value'] || '',
                unit: record['単位'] || record['unit'] || undefined,
                reference_min: record['基準値下限'] || record['reference_min'] || undefined,
                reference_max: record['基準値上限'] || record['reference_max'] || undefined,
            };
        }

        if (Object.keys(testItems).length === 0) {
            return { success: false, error: 'CSVファイルの形式が正しくありません' };
        }

        // 検査日を決定
        const testDate = testDateStr ? new Date(testDateStr) : new Date();

        // DBに保存
        await prisma.bloodTestResult.create({
            data: {
                patientId: parseInt(session.user.id),
                testDate,
                testItems,
                csvFileName: file.name,
            },
        });

        // キャッシュを更新
        revalidatePath('/dashboard');

        return { success: true };
    } catch (error) {
        console.error('CSV upload error:', error);
        return { success: false, error: 'CSVファイルの処理中にエラーが発生しました' };
    }
}

// ============================================================
// 医療センター用アクション
// ============================================================

/**
 * 医療センターの検査結果一覧を取得
 * 
 * @returns 検査結果一覧
 */
export async function getMedicalCenterBloodTestResults() {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
        throw new Error('認証が必要です');
    }

    const results = await prisma.bloodTestResult.findMany({
        where: { medicalCenterId: session.user.medicalCenterId },
        orderBy: { createdAt: 'desc' },
        include: {
            patient: {
                select: { id: true, name: true, email: true },
            },
            medicalCenterStaff: {
                select: { name: true },
            },
        },
        take: 100,
    });

    return results.map(result => ({
        id: result.id,
        testDate: result.testDate,
        patient: result.patient,
        staffName: result.medicalCenterStaff?.name,
        csvFileName: result.csvFileName,
        itemsCount: Object.keys(result.testItems as object).length,
        createdAt: result.createdAt,
    }));
}

/**
 * 医療センターが一括CSVをアップロード
 * 
 * @param formData フォームデータ
 * @returns アップロード結果
 */
export async function uploadMedicalCenterCSV(
    formData: FormData
): Promise<{ success: boolean; error?: string; logId?: number }> {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
        return { success: false, error: '認証が必要です' };
    }

    const file = formData.get('file') as File;

    if (!file) {
        return { success: false, error: 'ファイルを選択してください' };
    }

    try {
        // CSVを読み込み
        const text = await file.text();
        const records = parse(text, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        // アップロードログを作成
        const uploadLog = await prisma.csvUploadLog.create({
            data: {
                medicalCenterId: session.user.medicalCenterId,
                medicalCenterStaffId: parseInt(session.user.id),
                fileName: file.name,
                fileSize: file.size,
                totalRows: records.length,
                status: 'PROCESSING',
                startedAt: new Date(),
            },
        });

        let successRows = 0;
        let errorRows = 0;
        const errors: string[] = [];

        // 各行を処理
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const rowNumber = i + 2; // ヘッダー行 + 1-indexed

            try {
                // 患者を特定（メールアドレスで検索、なければ作成）
                const patientEmail = record['患者メール'] || record['patient_email'] || record['email'];
                const patientName = record['患者名'] || record['patient_name'] || record['name'] || '名前未設定';

                if (!patientEmail) {
                    errors.push(`行${rowNumber}: 患者メールアドレスが必要です`);
                    errorRows++;
                    continue;
                }

                let patient = await prisma.patient.findUnique({
                    where: { email: patientEmail },
                });

                if (!patient) {
                    // 患者が存在しない場合は作成（仮パスワード）
                    const { hash } = await import('bcryptjs');
                    patient = await prisma.patient.create({
                        data: {
                            email: patientEmail,
                            name: patientName,
                            passwordHash: await hash('temporary123', 12),
                        },
                    });
                }

                // テストアイテムを構築
                const testItems: Record<string, TestItemValue> = {};
                const itemName = record['項目名'] || record['item_name'];

                if (itemName) {
                    testItems[itemName] = {
                        value: record['結果値'] || record['value'] || '',
                        unit: record['単位'] || record['unit'] || undefined,
                        reference_min: record['基準値下限'] || record['reference_min'] || undefined,
                        reference_max: record['基準値上限'] || record['reference_max'] || undefined,
                    };
                }

                // 検査日
                const testDateStr = record['検査日'] || record['test_date'];
                const testDate = testDateStr ? new Date(testDateStr) : new Date();

                // 検査結果を登録
                await prisma.bloodTestResult.create({
                    data: {
                        patientId: patient.id,
                        testDate,
                        testItems,
                        medicalCenterId: session.user.medicalCenterId,
                        medicalCenterStaffId: parseInt(session.user.id),
                        csvFileName: file.name,
                        csvRowNumber: rowNumber,
                    },
                });

                successRows++;
            } catch (error) {
                errors.push(`行${rowNumber}: 処理エラー`);
                errorRows++;
            }
        }

        // アップロードログを更新
        await prisma.csvUploadLog.update({
            where: { id: uploadLog.id },
            data: {
                successRows,
                errorRows,
                errorDetails: errors.length > 0 ? JSON.stringify(errors) : null,
                status: errorRows === records.length ? 'FAILED' : 'COMPLETED',
                completedAt: new Date(),
            },
        });

        // キャッシュを更新
        revalidatePath('/mc/results');
        revalidatePath('/mc/dashboard');

        return {
            success: true,
            logId: uploadLog.id,
            error: errors.length > 0 ? `${errorRows}件のエラーがありました` : undefined,
        };
    } catch (error) {
        console.error('CSV upload error:', error);
        return { success: false, error: 'CSVファイルの処理中にエラーが発生しました' };
    }
}

/**
 * 医療センターの患者一覧を取得
 */
export async function getMedicalCenterPatients() {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
        throw new Error('認証が必要です');
    }

    // この医療センターが登録した検査結果の患者を取得
    const results = await prisma.bloodTestResult.findMany({
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
    });

    return results.map(r => r.patient);
}

/**
 * ダッシュボード統計を取得
 */
export async function getMedicalCenterDashboardStats() {
    const session = await auth();

    if (!session?.user?.id || session.user.userType !== 'staff' || !session.user.medicalCenterId) {
        throw new Error('認証が必要です');
    }

    const [totalResults, totalPatients, recentUploads] = await Promise.all([
        // 総検査結果数
        prisma.bloodTestResult.count({
            where: { medicalCenterId: session.user.medicalCenterId },
        }),
        // 総患者数
        prisma.bloodTestResult.findMany({
            where: { medicalCenterId: session.user.medicalCenterId },
            select: { patientId: true },
            distinct: ['patientId'],
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

    return {
        totalResults,
        totalPatients,
        recentUploads,
    };
}

