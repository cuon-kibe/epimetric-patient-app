/**
 * ログインフォームコンポーネント
 * 
 * 概要:
 *   患者ログイン用のフォーム（Client Component）
 *   Server Action を使用してログイン処理を実行
 */

'use client';

import { useActionState } from 'react';
import { loginPatient } from '@/app/actions/auth';

export function LoginForm() {
    const [state, formAction, isPending] = useActionState(loginPatient, undefined);

    return (
        <form className="mt-8 space-y-6" action={formAction}>
            {state?.error && (
                <div className="rounded-md bg-red-50 p-4">
                    <p className="text-sm text-red-800">{state.error}</p>
                </div>
            )}

            <div className="-space-y-px rounded-md shadow-sm">
                <div>
                    <label htmlFor="email" className="sr-only">
                        メールアドレス
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        className="relative block w-full rounded-t-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="メールアドレス"
                    />
                </div>
                <div>
                    <label htmlFor="password" className="sr-only">
                        パスワード
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        required
                        className="relative block w-full rounded-b-md border-0 px-3 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="パスワード"
                    />
                </div>
            </div>

            <div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
                >
                    {isPending ? 'ログイン中...' : 'ログイン'}
                </button>
            </div>
        </form>
    );
}

