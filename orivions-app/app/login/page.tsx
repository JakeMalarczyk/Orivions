import { Suspense } from 'react';
import type { Metadata } from 'next';
import AuthForm from './AuthForm';

export const metadata: Metadata = {
  title: 'Log in',
  robots: { index: false, follow: false }, // transactional page — never index
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}
