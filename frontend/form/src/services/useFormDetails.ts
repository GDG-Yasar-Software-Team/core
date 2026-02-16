import { useEffect, useState } from "react";
import type { FormResponse } from "../types";

interface UseFormDetailsReturn {
	form: FormResponse | null;
	isLoading: boolean;
	error: string | null;
}

const mockFormData: Record<string, FormResponse> = {
	"mock-form-1": {
		id: "mock-form-1",
		title: "GDG on Campus Yaşar - Üyelik Formu",
		description:
			"GDG on Campus Yaşar topluluğuna katılmak için lütfen aşağıdaki formu doldurun.",
		questions: [
			{
				fieldId: "fullname",
				fieldType: "text",
				label: "Ad Soyad",
				placeholder: "Adınızı ve soyadınızı girin",
				required: true,
				validation: { minLength: 2, maxLength: 100 },
			},
			{
				fieldId: "email",
				fieldType: "text",
				label: "E-posta",
				placeholder: "ornek@yasar.edu.tr",
				required: true,
				validation: {
					pattern: "^[\\w.-]+@[\\w.-]+\\.\\w{2,}$",
				},
			},
			{
				fieldId: "studentId",
				fieldType: "number",
				label: "Öğrenci No",
				placeholder: "Öğrenci numaranızı girin",
				required: true,
			},
			{
				fieldId: "department",
				fieldType: "select",
				label: "Bölüm",
				placeholder: "Bölümünüzü seçin",
				required: true,
				options: [
					"Bilgisayar Mühendisliği",
					"Yazılım Mühendisliği",
					"Elektrik-Elektronik Mühendisliği",
					"Endüstri Mühendisliği",
					"Makine Mühendisliği",
					"İç Mimarlık",
					"Diğer",
				],
			},
			{
				fieldId: "grade",
				fieldType: "radio",
				label: "Sınıf",
				required: true,
				options: [
					"Hazırlık",
					"1. Sınıf",
					"2. Sınıf",
					"3. Sınıf",
					"4. Sınıf",
					"Mezun / Yüksek Lisans",
				],
			},
			{
				fieldId: "phone",
				fieldType: "text",
				label: "Telefon Numarası",
				placeholder: "05XX XXX XX XX",
				required: false,
				validation: {
					pattern: "^[0-9+\\s()-]{10,15}$",
				},
			},
			{
				fieldId: "interests",
				fieldType: "checkbox",
				label: "İlgi Alanları",
				required: false,
				options: [
					"Web Geliştirme",
					"Mobil Geliştirme",
					"Yapay Zeka / ML",
					"Bulut Teknolojileri",
					"Siber Güvenlik",
					"UI/UX Tasarım",
				],
			},
			{
				fieldId: "bio",
				fieldType: "textarea",
				label: "Kendinizi Kısaca Tanıtın",
				placeholder: "Kendiniz hakkında birkaç cümle yazın...",
				required: false,
				validation: { maxLength: 500 },
			},
			{
				fieldId: "birthDate",
				fieldType: "date",
				label: "Doğum Tarihi",
				required: false,
			},
		],
		startDate: "2025-01-01T00:00:00Z",
		deadline: "2025-12-31T23:59:59Z",
		isActive: true,
		createdAt: "2025-01-01T00:00:00Z",
		viewCount: 150,
		submissionCount: 42,
	},
};

export function useFormDetails(formId: string | undefined): UseFormDetailsReturn {
	const [form, setForm] = useState<FormResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!formId) {
			setError("Form ID bulunamadı.");
			setIsLoading(false);
			return;
		}

		const fetchForm = async () => {
			setIsLoading(true);
			setError(null);

			// Simulate network delay
			await new Promise((resolve) => setTimeout(resolve, 500));

			const data = mockFormData[formId];
			if (data) {
				setForm(data);
			} else {
				setError("Form bulunamadı.");
			}
			setIsLoading(false);
		};

		fetchForm();
	}, [formId]);

	return { form, isLoading, error };
}
