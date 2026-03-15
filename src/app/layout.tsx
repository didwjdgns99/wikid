import type { Metadata } from 'next';
import './globals.css';
import '../styles/typography-system.css';
import '../styles/color-variables.css';
import { SnackBarProvider } from '@/contexts/SnackBarContext';
import Header from '@/components/Header/Header';
import { AuthProvider } from '@/contexts/AuthContext';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { GA_TRACKING_ID } from './lib/gtag';

export const metadata: Metadata = {
  metadataBase: new URL('https://wikid-19-8.vercel.app'),
  title: {
    default: 'WIKID - 나만의 위키를 만들어보세요',
    template: '%s | WIKID',
  },
  description:
    '위키드에서 나만의 위키를 만들고 공유하세요. 지식을 정리하고 공유하는 가장 쉬운 방법입니다.',
  keywords: [
    '위키',
    '위키드',
    'WIKID',
    '나만의 위키',
    '위키 만들기',
    '지식 공유',
    '정보 정리',
    '개인 위키',
    '온라인 위키',
    '협업 도구',
  ],
  authors: [{ name: 'WIKID Team' }],
  creator: 'WIKID',
  publisher: 'WIKID',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'WIKID - 나만의 위키를 만들어보세요',
    description:
      '위키드에서 나만의 위키를 만들고 공유하세요. 지식을 정리하고 공유하는 가장 쉬운 방법입니다.',
    url: 'https://wikid-19-8.vercel.app',
    siteName: 'WIKID',
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'WIKID - 나만의 위키를 만들어보세요',
    description:
      '위키드에서 나만의 위키를 만들고 공유하세요. 지식을 정리하고 공유하는 가장 쉬운 방법입니다.',
    creator: '@WIKID',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://wikid-19-8.vercel.app',
  },
  verification: {
    google: 'google-site-verification-code',
    other: {
      'naver-site-verification': 'naver-verification-code',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          as="style"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
        {/* JSX문법으로 작성 Script를 꼭 import해서 사용하기 strategy="afterInteractive" 는 화면이 인터랙티브 해진 뒤에 로드하라는 의미 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_TRACKING_ID}');
  `}
        </Script>
      </head>
      <body>
        <AuthProvider>
          <Header />
          <SnackBarProvider>{children}</SnackBarProvider>
        </AuthProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
