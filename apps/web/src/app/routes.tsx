import type { RouteObject } from 'react-router';
import { RootLayout } from './RootLayout';
import { NotFoundPage } from './NotFoundPage';
import { HomePage } from '../features/home/HomePage';

/**
 * Đường dẫn bằng tiếng Việt để trẻ và bố mẹ đọc hiểu được.
 * Trang chủ tải sẵn; các trang khác tải khi cần (ngân sách bundle trong
 * docs/tech-stack.md).
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    Component: RootLayout,
    // Router cần phần tử này cho lần dựng đầu khi có route lazy; màn hình trắng
    // chớp nhoáng tốt hơn là một spinner nhấp nháy.
    HydrateFallback: () => null,
    children: [
      { index: true, Component: HomePage },
      {
        path: 'ban-do',
        lazy: async () => ({ Component: (await import('../features/map/MapPage')).MapPage }),
      },
      {
        path: 'bai-hoc/:lessonId',
        lazy: async () => ({
          Component: (await import('../features/lesson/LessonPage')).LessonPage,
        }),
      },
      {
        path: 'bai-tap/:exerciseId',
        lazy: async () => ({
          Component: (await import('../features/exercise/ExercisePage')).ExercisePage,
        }),
      },
      {
        path: 'tien-do',
        lazy: async () => ({
          Component: (await import('../features/progress-code/ProgressCodePage')).ProgressCodePage,
        }),
      },
      {
        path: 'huy-hieu',
        lazy: async () => ({
          Component: (await import('../features/badges/BadgesPage')).BadgesPage,
        }),
      },
      {
        path: 'bao-cao',
        lazy: async () => ({
          Component: (await import('../features/report/ReportPage')).ReportPage,
        }),
      },
      {
        path: 'gioi-thieu',
        lazy: async () => ({ Component: (await import('../features/about/AboutPage')).AboutPage }),
      },
      {
        path: 'quyen-rieng-tu',
        lazy: async () => ({
          Component: (await import('../features/about/PrivacyPage')).PrivacyPage,
        }),
      },
      // Trang thử runner chỉ tồn tại khi chạy dev; bản phát hành không có.
      ...(import.meta.env.DEV
        ? [
            {
              path: 'thu-runner',
              lazy: async () => ({
                Component: (await import('../features/dev/RunnerSandboxPage')).RunnerSandboxPage,
              }),
            },
            {
              path: 'dev/design',
              lazy: async () => ({
                Component: (await import('../features/dev/DesignPreviewPage')).DesignPreviewPage,
              }),
            },
          ]
        : []),
      { path: '*', Component: NotFoundPage },
    ],
  },
];
