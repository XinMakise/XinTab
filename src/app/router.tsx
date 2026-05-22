import { Suspense, lazy } from "react";

import { HashRouter, Navigate, Route, Routes } from "react-router-dom";

const HomePage = lazy(() => import("@/pages/home/ui/Page"));
const BookmarksPage = lazy(() => import("@/pages/bookmarks/ui/Page"));
const NotFoundPage = lazy(() => import("@/pages/not-found/ui/Page"));

export function AppRouter() {
  return (
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">加载中…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/index.html" element={<Navigate to="/" replace />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </HashRouter>
  );
}
