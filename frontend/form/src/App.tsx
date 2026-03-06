import { Navigate, Route, Routes } from "react-router-dom";
import PageWithGlobe from "./components/PageWithGlobe";
import AdminFormViewsPage from "./pages/AdminFormViewsPage";
import AdminFormListPage from "./pages/admin/AdminFormListPage";
import FormEditorPage from "./pages/admin/FormEditorPage";
import FormSubmissionPage from "./pages/FormSubmissionPage";

function Home() {
	return (
		<PageWithGlobe>
			<div className="min-h-screen flex items-center justify-center px-4 pointer-events-none">
				<div className="rounded-2xl border border-slate-200/80 bg-white/90 px-8 py-6 shadow-xl shadow-slate-200/50 backdrop-blur-sm pointer-events-auto">
					<div className="flex items-center gap-3">
						<img
							src="/gdg-logo.png"
							alt="GDG"
							className="h-10 w-10 object-contain"
						/>
						<div>
							<p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
								GDG on Campus
							</p>
							<h1 className="text-lg font-bold text-slate-800">
								Yaşar Üniversitesi
							</h1>
						</div>
					</div>
					<p className="mt-4 text-sm text-slate-600">
						Form Uygulaması
					</p>
					<div className="mt-3 flex items-center gap-1.5">
						<span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
						<span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
						<span className="h-1.5 w-1.5 rounded-full bg-[#FBBC04]" />
						<span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
					</div>
				</div>
			</div>
		</PageWithGlobe>
	);
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/forms/:formId" element={<FormSubmissionPage />} />
			<Route path="/views/:formId" element={<AdminFormViewsPage />} />
			<Route path="/admin/forms" element={<AdminFormListPage />} />
			<Route path="/admin/forms/editor" element={<FormEditorPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
