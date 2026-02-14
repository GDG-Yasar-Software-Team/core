import FormSubmissionPage from "./pages/FormSubmissionPage";

import type { FormCreate } from "./types";

const sampleForm: FormCreate = {
	title: "GDG on Campus Formu",
	description:
		"Topluluğumuza katılmak ve etkinliklerimizden haberdar olmak için lütfen aşağıdaki bilgileri eksiksiz doldurunuz.",
	questions: [
		{
			fieldId: "fullname",
			fieldType: "text",
			label: "Ad Soyad",
			required: true,
		},
		{
			fieldId: "studentid",
			fieldType: "text",
			label: "Öğrenci No",
			required: true,
		},
		{
			fieldId: "department",
			fieldType: "select",
			label: "Bölüm",
			required: true,
			options: [
				"Bilgisayar Mühendisliği",
				"Yazılım Mühendisliği",
				"Elektrik-Elektronik Mühendisliği",
				"Diğer",
			],
		},
		{
			fieldId: "grade",
			fieldType: "select",
			label: "Sınıf",
			required: true,
			options: [
				"Hazırlık",
				"1. Sınıf",
				"2. Sınıf",
				"3. Sınıf",
				"4. Sınıf",
				"Yüksek Lisans / Mezun",
			],
		},
	],
	isActive: true,
};


function App() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<FormSubmissionPage />
		</div>
	);
}

export default App;
