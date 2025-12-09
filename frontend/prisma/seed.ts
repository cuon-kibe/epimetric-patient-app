/**
 * Prisma シードスクリプト
 * 
 * 概要:
 *   開発用のテストデータを投入
 * 
 * 使用方法:
 *   npx prisma db seed
 */

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 シードデータを投入中...');

    // ============================================================
    // テスト患者
    // ============================================================

    const patientPassword = await hash('password123', 12);

    const patient = await prisma.patient.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            passwordHash: patientPassword,
            name: '山田太郎',
            dateOfBirth: new Date('1990-01-01'),
        },
    });

    console.log('✅ テスト患者を作成:', patient.email);

    // ============================================================
    // 血液検査結果
    // ============================================================

    const bloodTestResult = await prisma.bloodTestResult.upsert({
        where: { id: 1 },
        update: {},
        create: {
            patientId: patient.id,
            testDate: new Date('2024-12-01'),
            testItems: {
                'WBC': { value: '5000', unit: '/μL', reference_min: '4000', reference_max: '9000' },
                'RBC': { value: '450', unit: '万/μL', reference_min: '400', reference_max: '550' },
                'Hb': { value: '14.5', unit: 'g/dL', reference_min: '13.5', reference_max: '17.5' },
                'Ht': { value: '42', unit: '%', reference_min: '40', reference_max: '50' },
                'PLT': { value: '25', unit: '万/μL', reference_min: '15', reference_max: '40' },
                'AST': { value: '25', unit: 'U/L', reference_min: '10', reference_max: '40' },
                'ALT': { value: '20', unit: 'U/L', reference_min: '5', reference_max: '45' },
                'γ-GTP': { value: '35', unit: 'U/L', reference_min: '0', reference_max: '80' },
                '総コレステロール': { value: '200', unit: 'mg/dL', reference_min: '150', reference_max: '219' },
                'LDLコレステロール': { value: '120', unit: 'mg/dL', reference_min: '70', reference_max: '139' },
                'HDLコレステロール': { value: '55', unit: 'mg/dL', reference_min: '40', reference_max: '100' },
                '中性脂肪': { value: '100', unit: 'mg/dL', reference_min: '30', reference_max: '149' },
                '血糖値': { value: '95', unit: 'mg/dL', reference_min: '70', reference_max: '109' },
                'HbA1c': { value: '5.5', unit: '%', reference_min: '4.6', reference_max: '6.2' },
            },
        },
    });

    console.log('✅ 血液検査結果を作成:', bloodTestResult.id);

    // ============================================================
    // 医療機関
    // ============================================================

    const medicalCenter = await prisma.medicalCenter.upsert({
        where: { code: 'MC001' },
        update: {},
        create: {
            name: 'テスト医療センター',
            code: 'MC001',
            email: 'center@example.com',
            phone: '03-1234-5678',
            address: '東京都千代田区1-1-1',
            active: true,
        },
    });

    console.log('✅ 医療機関を作成:', medicalCenter.name);

    // ============================================================
    // 医療機関スタッフ
    // ============================================================

    const staffPassword = await hash('staff123', 12);

    const staff = await prisma.medicalCenterStaff.upsert({
        where: { email: 'staff@example.com' },
        update: {},
        create: {
            medicalCenterId: medicalCenter.id,
            email: 'staff@example.com',
            passwordHash: staffPassword,
            name: '佐藤花子',
            role: 'ADMIN',
            active: true,
        },
    });

    console.log('✅ 医療機関スタッフを作成:', staff.email);

    console.log('');
    console.log('🎉 シードデータの投入が完了しました！');
    console.log('');
    console.log('📋 ログイン情報:');
    console.log('  患者:');
    console.log('    メール: test@example.com');
    console.log('    パスワード: password123');
    console.log('');
    console.log('  医療機関スタッフ:');
    console.log('    メール: staff@example.com');
    console.log('    パスワード: staff123');
}

main()
    .catch((e) => {
        console.error('❌ シードエラー:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

