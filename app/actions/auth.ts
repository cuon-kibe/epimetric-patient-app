/**
 * 認証 Server Actions
 * 
 * 概要:
 *   ログイン、ログアウト、患者登録のServer Actions
 *   フォームからの呼び出しに対応
 * 
 * 使用例:
 *   import { loginPatient, registerPatient } from '@/app/actions/auth';
 *   await loginPatient(formData);
 */

'use server';

import { signIn, signOut } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { redirect } from 'next/navigation';
import { z } from 'zod';

// ============================================================
// バリデーションスキーマ
// ============================================================

const loginSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(1, 'パスワードを入力してください'),
});

const registerSchema = z.object({
    email: z.string().email('有効なメールアドレスを入力してください'),
    password: z.string().min(8, 'パスワードは8文字以上で入力してください'),
    passwordConfirmation: z.string(),
    name: z.string().min(1, '名前を入力してください'),
    dateOfBirth: z.string().optional(),
}).refine((data) => data.password === data.passwordConfirmation, {
    message: 'パスワードが一致しません',
    path: ['passwordConfirmation'],
});

// ============================================================
// 患者認証
// ============================================================

/**
 * 患者ログイン
 * 
 * @param prevState 前の状態（フォーム用）
 * @param formData フォームデータ
 * @returns エラーメッセージまたはリダイレクト
 */
export async function loginPatient(
    prevState: { error?: string } | undefined,
    formData: FormData
): Promise<{ error?: string }> {
    const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    // バリデーション
    const validated = loginSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    try {
        await signIn('patient-credentials', {
            email: validated.data.email,
            password: validated.data.password,
            redirect: false,
        });
    } catch (error) {
        return { error: 'メールアドレスまたはパスワードが正しくありません' };
    }

    redirect('/dashboard');
}

/**
 * 患者登録
 * 
 * @param prevState 前の状態（フォーム用）
 * @param formData フォームデータ
 * @returns エラーメッセージまたはリダイレクト
 */
export async function registerPatient(
    prevState: { error?: string } | undefined,
    formData: FormData
): Promise<{ error?: string }> {
    const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        passwordConfirmation: formData.get('passwordConfirmation') as string,
        name: formData.get('name') as string,
        dateOfBirth: formData.get('dateOfBirth') as string || undefined,
    };

    // バリデーション
    const validated = registerSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    // メールアドレスの重複チェック
    const existingPatient = await prisma.patient.findUnique({
        where: { email: validated.data.email },
    });

    if (existingPatient) {
        return { error: 'このメールアドレスは既に登録されています' };
    }

    // パスワードをハッシュ化
    const passwordHash = await hash(validated.data.password, 12);

    // 患者を作成
    await prisma.patient.create({
        data: {
            email: validated.data.email,
            passwordHash,
            name: validated.data.name,
            dateOfBirth: validated.data.dateOfBirth
                ? new Date(validated.data.dateOfBirth)
                : null,
        },
    });

    // ログイン
    try {
        await signIn('patient-credentials', {
            email: validated.data.email,
            password: validated.data.password,
            redirect: false,
        });
    } catch (error) {
        return { error: '登録は完了しましたが、ログインに失敗しました。ログインページからログインしてください。' };
    }

    redirect('/dashboard');
}

// ============================================================
// 医療センタースタッフ認証
// ============================================================

/**
 * 医療センタースタッフログイン
 * 
 * @param prevState 前の状態（フォーム用）
 * @param formData フォームデータ
 * @returns エラーメッセージまたはリダイレクト
 */
export async function loginStaff(
    prevState: { error?: string } | undefined,
    formData: FormData
): Promise<{ error?: string }> {
    const rawData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    };

    // バリデーション
    const validated = loginSchema.safeParse(rawData);
    if (!validated.success) {
        return { error: validated.error.errors[0].message };
    }

    try {
        await signIn('staff-credentials', {
            email: validated.data.email,
            password: validated.data.password,
            redirect: false,
        });
    } catch (error) {
        return { error: 'メールアドレスまたはパスワードが正しくありません' };
    }

    redirect('/mc/dashboard');
}

// ============================================================
// 共通
// ============================================================

/**
 * ログアウト
 */
export async function logout() {
    await signOut({ redirect: false });
    redirect('/login');
}

/**
 * 医療センター用ログアウト
 */
export async function logoutStaff() {
    await signOut({ redirect: false });
    redirect('/mc/login');
}

