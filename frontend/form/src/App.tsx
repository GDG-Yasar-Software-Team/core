import FormSubmissionPage from "./pages/FormSubmissionPage";
import type { FormResponse } from "./types";

const sampleForm: FormResponse = {
	id: "form-001",
	title: "GDG Etkinlik Kayıt Formu",
	description:
		"Lütfen formu eksiksiz doldurunuz. Tüm bilgileriniz gizli tutulacaktır.",
	questions: [
		{
			fieldId: "q1",
			fieldType: "text",
			label: "İsim Soyisim",
			required: true,
		},
		{
			fieldId: "q2",
			fieldType: "text",
			label: "E-posta Adresi",
			required: true,
		},
		{
			fieldId: "q3",
			fieldType: "text",
			label: "Bölüm",
			required: true,
		},
		{
			fieldId: "q4",
			fieldType: "select",
			label: "Sınıf",
			required: true,
			options: ["Hazırlık", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
		},
		{
			fieldId: "q5",
			fieldType: "text",
			label: "Öğrenci Numarası",
			required: true,
		},
	],
	isActive: true,
	createdAt: "2025-01-15T10:00:00Z",
	viewCount: 150,
	submissionCount: 45,
};

function App() {
	return <FormSubmissionPage form={sampleForm} />;
}

export default App;
