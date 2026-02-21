import { Navigate, Route, Routes } from "react-router-dom";
import AdminFormViewsPage from "./pages/AdminFormViewsPage";
import FormSubmissionPage from "./pages/FormSubmissionPage";

function Home() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
			<div className="text-center">
				<p className="text-sm text-gray-600">This is form app.</p>
			</div>
		</div>
	);
}

function App() {
	return (
		<Routes>
			<Route path="/" element={<Home />} />
			<Route path="/forms/:formId" element={<FormSubmissionPage />} />
			<Route path="/views/:formId" element={<AdminFormViewsPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
