import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

/**
 * Lazy load non-critical routes to reduce initial bundle size
 */
const AdminFormViewsPage = lazy(() => import("./pages/AdminFormViewsPage"));
const AdminFormListPage = lazy(() => import("./pages/admin/AdminFormListPage"));
const FormEditorPage = lazy(() => import("./pages/admin/FormEditorPage"));
const FormSubmissionPage = lazy(() => import("./pages/FormSubmissionPage"));

/**
 * Loading fallback for lazy-loaded routes
 */
function RouteLoadingFallback() {
	return (
		<div className="min-h-screen bg-white flex items-center justify-center">
			<div className="text-emerald-600/70 text-sm font-mono animate-pulse">
				Loading...
			</div>
		</div>
	);
}

function App() {
	return (
		<Routes>
			{/* Home redirects to admin panel */}
			<Route path="/" element={<Navigate to="/admin/forms" replace />} />
			{/* Lazy-loaded routes with Suspense fallback */}
			<Route
				path="/forms/:formId"
				element={
					<Suspense fallback={<RouteLoadingFallback />}>
						<FormSubmissionPage />
					</Suspense>
				}
			/>
			<Route
				path="/views/:formId"
				element={
					<Suspense fallback={<RouteLoadingFallback />}>
						<AdminFormViewsPage />
					</Suspense>
				}
			/>
			<Route
				path="/admin/forms"
				element={
					<Suspense fallback={<RouteLoadingFallback />}>
						<AdminFormListPage />
					</Suspense>
				}
			/>
			<Route
				path="/admin/forms/editor"
				element={
					<Suspense fallback={<RouteLoadingFallback />}>
						<FormEditorPage />
					</Suspense>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
