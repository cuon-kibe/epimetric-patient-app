/**
 * NextAuth.js 認証設定
 * 
 * 概要:
 *   NextAuth.js v5 (Auth.js) を使用した認証設定
 *   患者と医療センタースタッフの両方に対応
 * 
 * 認証方式:
 *   - Credentials Provider（メール/パスワード認証）
 *   - JWTセッション（Cookieベース）
 * 
 * 使用例:
 *   import { auth, signIn, signOut } from '@/lib/auth';
 *   const session = await auth();
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

/**
 * ユーザータイプ
 */
export type UserType = 'patient' | 'staff';

/**
 * セッションユーザーの型定義
 */
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
            userType: UserType;
            medicalCenterId?: number;
        };
    }

    interface User {
        id: string;
        email: string;
        name: string;
        userType: UserType;
        medicalCenterId?: number;
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string;
        userType: UserType;
        medicalCenterId?: number;
    }
}

/**
 * NextAuth.js 設定
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        // 患者用認証
        Credentials({
            id: 'patient-credentials',
            name: 'Patient Login',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const patient = await prisma.patient.findUnique({
                    where: { email: credentials.email as string },
                });

                if (!patient) {
                    return null;
                }

                const isValidPassword = await compare(
                    credentials.password as string,
                    patient.passwordHash
                );

                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: patient.id.toString(),
                    email: patient.email,
                    name: patient.name,
                    userType: 'patient' as UserType,
                };
            },
        }),

        // 医療センタースタッフ用認証
        Credentials({
            id: 'staff-credentials',
            name: 'Staff Login',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const staff = await prisma.medicalCenterStaff.findUnique({
                    where: { email: credentials.email as string },
                    include: { medicalCenter: true },
                });

                if (!staff || !staff.active || !staff.medicalCenter.active) {
                    return null;
                }

                const isValidPassword = await compare(
                    credentials.password as string,
                    staff.passwordHash
                );

                if (!isValidPassword) {
                    return null;
                }

                return {
                    id: staff.id.toString(),
                    email: staff.email,
                    name: staff.name,
                    userType: 'staff' as UserType,
                    medicalCenterId: staff.medicalCenterId,
                };
            },
        }),
    ],

    callbacks: {
        // JWTにユーザー情報を追加
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.userType = user.userType;
                token.medicalCenterId = user.medicalCenterId;
            }
            return token;
        },

        // セッションにユーザー情報を追加
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.userType = token.userType;
                session.user.medicalCenterId = token.medicalCenterId;
            }
            return session;
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24時間
    },

    trustHost: true,
});

