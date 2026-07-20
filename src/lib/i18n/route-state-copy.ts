import {
  defaultLocale,
  isLocale,
  type Locale,
} from "@/config/locales";

type RouteStateCopy = {
  loading: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  home: string;
};

/**
 * Small client-safe copy set for route loading/error boundaries.
 * Keeping this separate avoids shipping the complete dictionaries in fallback UI.
 */
export const routeStateCopy: Record<Locale, RouteStateCopy> = {
  en: {
    loading: "Loading this page…",
    errorTitle: "This page could not be loaded",
    errorDescription:
      "An unexpected problem interrupted this page. Try again or return home.",
    retry: "Try again",
    home: "Return home",
  },
  zh: {
    loading: "正在加载页面…",
    errorTitle: "无法加载此页面",
    errorDescription: "意外问题中断了此页面。请重试或返回首页。",
    retry: "重试",
    home: "返回首页",
  },
  th: {
    loading: "กำลังโหลดหน้านี้…",
    errorTitle: "ไม่สามารถโหลดหน้านี้ได้",
    errorDescription:
      "เกิดปัญหาที่ไม่คาดคิดและทำให้หน้านี้หยุดทำงาน โปรดลองอีกครั้งหรือกลับไปหน้าแรก",
    retry: "ลองอีกครั้ง",
    home: "กลับหน้าแรก",
  },
};

export function routeStateLocale(
  value: string | string[] | undefined,
): Locale {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate && isLocale(candidate) ? candidate : defaultLocale;
}
