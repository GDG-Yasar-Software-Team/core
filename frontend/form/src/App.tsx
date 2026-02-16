import { Navigate, Route, Routes } from "react-router-dom";
import FormSubmissionPage from "./pages/FormSubmissionPage";

function App() {
	return (
		<Routes>
			<Route path="/forms/:formId" element={<FormSubmissionPage />} />
			<Route
				path="*"
				element={<Navigate to="/forms/mock-form-1" replace />}
			/>
		</Routes>
	);
}

export default App;
