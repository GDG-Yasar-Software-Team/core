import { Navigate, Route, Routes } from "react-router-dom";
import { CyberGlobe, CyberCard } from "./components/cyber-globe";
import AdminFormViewsPage from "./pages/AdminFormViewsPage";
import AdminFormListPage from "./pages/admin/AdminFormListPage";
import FormEditorPage from "./pages/admin/FormEditorPage";
import FormSubmissionPage from "./pages/FormSubmissionPage";

function Home() {
	return (
		<>
			<CyberGlobe />
			<div className="relative z-20 min-h-screen flex items-center justify-center px-4">
				<CyberCard />
			</div>
		</>
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
