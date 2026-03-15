// src/lib/gtag.ts

// .env.local 에서 가져오는 GA ID
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

// window.gtag 타입 때문에 TS가 뭐라 안 하게 any로 캐스팅
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// 페이지뷰 추적
export const pageview = (url: string) => {
  if (!GA_TRACKING_ID) return;
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('config', GA_TRACKING_ID, {
    page_path: url,
  });
};

// 커스텀 이벤트 추적
interface GAEventParams {
  action: string;
  parameters?: Record<string, any>;
}

export const event = ({ action, parameters = {} }: GAEventParams) => {
  if (!GA_TRACKING_ID) return;
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('event', action, parameters);
};
