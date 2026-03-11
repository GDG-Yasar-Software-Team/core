import { useEffect, useMemo, useState } from "react";
import { type FieldError, type FieldErrors, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import AdminPasswordGate from "../../components/AdminPasswordGate";
import Banner from "../../components/Banner";
import { DatePicker } from "../../components/DatePicker";
import FieldRenderer from "../../components/FieldRenderer";
import FormFieldList from "../../components/FormFieldList";
import { PhoneMockup } from "../../components/PhoneMockup";
import {
	createForm,
	getFormById,
	updateForm,
} from "../../services/formService";
import type {
	FormCreate,
	FormFieldSchema,
	FormResponse,
	FormUpdate,
} from "../../types";

type FormValues = Record<string, unknown>;

type EditorMode = "edit" | "preview";

function generateFieldId(): string {
	return `field_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function createEmptyField(): FormFieldSchema {
	const key = generateFieldId();
	return {
		_key: key,
		field_id: key,
		field_type: "text",
		label: "",
		required: false,
	};
}

function createDefaultFields(): FormFieldSchema[] {
	return [
		{
			_key: generateFieldId(),
			field_id: "isim_soyisim",
			field_type: "text",
			label: "İsim - Soyisim",
			placeholder: "yanıtınız...",
			required: true,
		},
		{
			_key: generateFieldId(),
			field_id: "blm",
			field_type: "department",
			label: "Bölüm",
			placeholder: "seçiniz...",
			required: true,
			options: [
				"Bilgisayar Mühendisliği",
				"Çizgi Film ve Animasyon",
				"Ekonomi",
				"Elektrik-Elektronik Mühendisliği",
				"Endüstri Mühendisliği",
				"Endüstriyel Tasarım",
				"Enerji Sistemleri Mühendisliği",
				"Gastronomi ve Mutfak Sanatları",
				"Görsel İletişim Tasarımı",
				"Halkla İlişkiler ve Reklamcılık",
				"Hukuk",
				"İç Mimarlık ve Çevre Tasarımı",
				"İngiliz Dili ve Edebiyatı",
				"İngilizce Mütercim ve Tercümanlık",
				"İnşaat Mühendisliği",
				"İşletme",
				"Lojistik Yönetimi",
				"Makine Mühendisliği",
				"Mimarlık",
				"Psikoloji",
				"Radyo, Televizyon ve Sinema",
				"Tarım Ekonomisi",
				"Tarım Makineleri ve Teknolojileri Mühendisliği",
				"Turizm Rehberliği",
				"Uluslararası İlişkiler",
				"Uluslararası Ticaret ve Finansman",
				"Yazılım Mühendisliği",
				"Yeni Medya ve İletişim",
				"Yönetim Bilişim Sistemleri",
				"Diğer",
			],
		},
		{
			_key: generateFieldId(),
			field_id: "snf",
			field_type: "select",
			label: "Sınıf",
			placeholder: "seçiniz...",
			required: true,
			options: ["Hazırlık", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
		},
		{
			_key: generateFieldId(),
			field_id: "aktif_olarak_yasar_universitesi_ogrencisi_misiniz",
			field_type: "radio",
			label: "Aktif olarak Yaşar Üniversitesi öğrencisi misiniz?",
			required: true,
			options: ["Evet", "Hayır"],
		},
		{
			_key: generateFieldId(),
			field_id: "etkinligimizi_nereden_duydunuz",
			field_type: "radio",
			label: "Etkinliğimizi nereden duydunuz?",
			required: true,
			options: [
				"Arkadaş Tavsiyesi",
				"Üniversite İçindeki Afişlerden",
				"Instagram",
				"Whatsapp Grubu",
				"LinkedIn",
				"Davetiye",
				"Mail",
			],
		},
	];
}

function cleanFieldForSave(field: FormFieldSchema): FormFieldSchema {
	const cleaned: FormFieldSchema = {
		field_id: field.field_id.slice(0, 32),
		field_type: field.field_type,
		label: field.label,
		required: field.required,
	};
	delete cleaned._key;

	if (field.placeholder?.trim()) {
		cleaned.placeholder = field.placeholder.trim();
	}

	if (field.options && field.options.length > 0) {
		cleaned.options = field.options;
	}

	if (field.validation) {
		const v = field.validation;
		const hasValues =
			v.min_length !== undefined ||
			v.max_length !== undefined ||
			v.min_value !== undefined ||
			v.max_value !== undefined ||
			v.pattern?.trim();
		if (hasValues) {
			cleaned.validation = {};
			if (v.min_length !== undefined)
				cleaned.validation.min_length = v.min_length;
			if (v.max_length !== undefined)
				cleaned.validation.max_length = v.max_length;
			if (v.min_value !== undefined) cleaned.validation.min_value = v.min_value;
			if (v.max_value !== undefined) cleaned.validation.max_value = v.max_value;
			if (v.pattern?.trim()) cleaned.validation.pattern = v.pattern.trim();
		}
	}

	if (field.condition?.depends_on && field.condition.values?.length > 0) {
		cleaned.condition = {
			depends_on: field.condition.depends_on,
			values: field.condition.values,
		};
	}

	return cleaned;
}

const FormEditorPage = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const formId = searchParams.get("id");
	const isEditMode = Boolean(formId);

	const [mode, setMode] = useState<EditorMode>("edit");
	const [isLoading, setIsLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [saveError, setSaveError] = useState<string | null>(null);

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [startDate, setStartDate] = useState("");
	const [deadline, setDeadline] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [fields, setFields] = useState<FormFieldSchema[]>([]);

	const [existingFieldIds, setExistingFieldIds] = useState<Set<string>>(
		new Set(),
	);

	const {
		register,
		reset,
		formState: { errors },
	} = useForm<FormValues>();

	useEffect(() => {
		if (!formId) return;

		let isCancelled = false;

		async function loadForm() {
			setIsLoading(true);
			setLoadError(null);

			try {
				const form: FormResponse = await getFormById(formId!);
				if (isCancelled) return;

				setTitle(form.title);
				setDescription(form.description ?? "");
				setStartDate(form.start_date?.split("T")[0] ?? "");
				setDeadline(form.deadline?.split("T")[0] ?? "");
				setIsActive(form.is_active);
				setFields(form.questions);
				setExistingFieldIds(new Set(form.questions.map((q) => q.field_id)));

				const defaults = form.questions.reduce<FormValues>((acc, field) => {
					acc[field.field_id] = "";
					return acc;
				}, {});
				reset(defaults);
			} catch (err) {
				if (isCancelled) return;
				setLoadError(err instanceof Error ? err.message : "Form yüklenemedi");
			} finally {
				if (!isCancelled) setIsLoading(false);
			}
		}

		loadForm();

		return () => {
			isCancelled = true;
		};
	}, [formId, reset]);

	const handleAddField = () => {
		setFields((prev) => [...prev, createEmptyField()]);
	};

	const handleAddDefaultFields = () => {
		const defaultFieldIds = new Set([
			"isim_soyisim",
			"blm",
			"snf",
			"aktif_olarak_yasar_universitesi_ogrencisi_misiniz",
			"etkinligimizi_nereden_duydunuz",
		]);

		// Check if any default field already exists
		const existingIds = new Set(fields.map((f) => f.field_id));
		const hasAnyDefault = [...defaultFieldIds].some((id) => existingIds.has(id));

		if (hasAnyDefault) {
			return; // Early return - default fields already exist
		}

		setFields((prev) => [...prev, ...createDefaultFields()]);
	};

	const validateForm = (): string | null => {
		if (!title.trim()) {
			return "Form başlığı zorunludur.";
		}

		if (fields.length === 0) {
			return "En az bir alan eklemelisiniz.";
		}

		for (let i = 0; i < fields.length; i++) {
			const field = fields[i];
			if (!field.label.trim()) {
				return `Alan ${i + 1}: Etiket zorunludur.`;
			}
			if (!field.field_id.trim()) {
				return `Alan ${i + 1}: Alan ID zorunludur.`;
			}
		}

		const fieldIds = fields.map((f) => f.field_id);
		const duplicates = fieldIds.filter(
			(id, index) => fieldIds.indexOf(id) !== index,
		);
		if (duplicates.length > 0) {
			return `Birden fazla alan aynı ID'yi kullanıyor: ${duplicates[0]}`;
		}

		return null;
	};

	const handleSave = async () => {
		const validationError = validateForm();
		if (validationError) {
			setSaveError(validationError);
			return;
		}

		setIsSaving(true);
		setSaveError(null);

		try {
			const payload: FormCreate = {
				title: title.trim(),
				description: description.trim() || null,
				questions: fields.map(cleanFieldForSave),
				is_active: isActive,
			};

			if (startDate) {
				payload.start_date = new Date(startDate).toISOString();
			}
			if (deadline) {
				payload.deadline = new Date(deadline).toISOString();
			}

			if (isEditMode && formId) {
				const updatePayload: FormUpdate = {
					...payload,
					description: payload.description,
				};
				await updateForm(formId, updatePayload);
			} else {
				await createForm(payload);
			}

			navigate("/admin/forms");
		} catch (err) {
			setSaveError(err instanceof Error ? err.message : "Kaydetme başarısız");
		} finally {
			setIsSaving(false);
		}
	};

	const previewForm = useMemo(
		() => ({
			id: formId ?? "preview",
			title: title || "Form Önizleme",
			description: description || undefined,
			questions: fields,
			start_date: startDate || undefined,
			deadline: deadline || undefined,
			is_active: isActive,
			created_at: new Date().toISOString(),
			view_count: 0,
			submission_count: 0,
		}),
		[title, description, fields, startDate, deadline, isActive, formId],
	);

	if (isLoading) {
		return (
			<AdminPasswordGate>
				<div className="min-h-screen bg-slate-100 flex items-center justify-center">
					<div className="text-center">
						<div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
						<p className="mt-4 text-slate-500">Form yükleniyor...</p>
					</div>
				</div>
			</AdminPasswordGate>
		);
	}

	if (loadError) {
		return (
			<AdminPasswordGate>
				<div className="min-h-screen bg-slate-100 flex items-center justify-center">
					<div className="text-center max-w-md">
						<p className="text-red-500 text-lg font-semibold">{loadError}</p>
						<button
							type="button"
							onClick={() => navigate("/admin/forms")}
							className="mt-4 text-blue-600 hover:underline"
						>
							Form Listesine Dön
						</button>
					</div>
				</div>
			</AdminPasswordGate>
		);
	}

	return (
		<AdminPasswordGate>
			<div className="min-h-screen bg-slate-100 px-4 py-8">
				<div className="mx-auto max-w-4xl space-y-6">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-2xl font-semibold text-slate-900">
								{isEditMode ? "Formu Düzenle" : "Yeni Form Oluştur"}
							</h1>
							<p className="mt-1 text-sm text-slate-500">
								{isEditMode
									? "Mevcut formu düzenleyin ve kaydedin."
									: "Form alanlarını ekleyin ve yapılandırın."}
							</p>
						</div>
						<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
							<button
								type="button"
								onClick={() => setMode("edit")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
									mode === "edit"
										? "bg-[#4285F4] text-white"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								Düzenle
							</button>
							<button
								type="button"
								onClick={() => setMode("preview")}
								className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
									mode === "preview"
										? "bg-[#4285F4] text-white"
										: "text-slate-600 hover:bg-slate-100"
								}`}
							>
								Önizleme
							</button>
						</div>
					</div>

					{mode === "edit" ? (
						<>
							<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
								<h2 className="text-lg font-semibold text-slate-900">
									Form Bilgileri
								</h2>

								<div className="group relative mt-2">
									<label className="pointer-events-none absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs font-semibold text-slate-500 transition-colors duration-200 group-focus-within:text-violet-600">
										Başlık <span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										className="w-full rounded-2xl border-2 border-slate-200 px-4 pb-3 pt-5 text-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
										placeholder="Form başlığı"
									/>
								</div>

								<div className="group relative mt-2">
									<label className="pointer-events-none absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs font-semibold text-slate-500 transition-colors duration-200 group-focus-within:text-violet-600">
										Açıklama
									</label>
									<textarea
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										rows={3}
										className="w-full resize-none rounded-2xl border-2 border-slate-200 px-4 pb-3 pt-5 text-sm transition-all duration-200 hover:border-slate-300 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-100"
										placeholder="Form açıklaması (opsiyonel)"
									/>
								</div>

								<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
									<DatePicker
										label="Başlangıç Tarihi"
										value={startDate}
										onChange={setStartDate}
									/>
									<DatePicker
										label="Bitiş Tarihi"
										value={deadline}
										onChange={setDeadline}
									/>
								</div>

								<div className="flex items-center gap-3">
									<button
										type="button"
										onClick={() => setIsActive(!isActive)}
										className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
											isActive ? "bg-[#4285F4]" : "bg-gray-300"
										}`}
									>
										<span
											className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
												isActive ? "translate-x-6" : "translate-x-1"
											}`}
										/>
									</button>
									<span className="text-sm font-medium text-slate-700">
										{isActive ? "Aktif" : "Pasif"}
									</span>
								</div>
							</div>

							<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
								<div className="flex items-center justify-between">
									<h2 className="text-lg font-semibold text-slate-900">
										Form Alanları
									</h2>
									<div className="flex gap-2">
										<button
											type="button"
											onClick={handleAddDefaultFields}
											className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
										>
											+ Varsayılan Şablon
										</button>
										<button
											type="button"
											onClick={handleAddField}
											className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
										>
											+ Alan Ekle
										</button>
									</div>
								</div>

								<FormFieldList
									fields={fields}
									existingFieldIds={existingFieldIds}
									onChange={setFields}
								/>
							</div>

							{saveError && (
								<div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
									{saveError}
								</div>
							)}

							<div className="flex items-center justify-end gap-3">
								<button
									type="button"
									onClick={() => navigate("/admin/forms")}
									className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
								>
									İptal
								</button>
								<button
									type="button"
									onClick={handleSave}
									disabled={isSaving}
									className="rounded-lg bg-[#4285F4] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3367D6] disabled:opacity-50"
								>
									{isSaving
										? "Kaydediliyor..."
										: isEditMode
											? "Değişiklikleri Kaydet"
											: "Formu Oluştur"}
								</button>
							</div>
						</>
					) : (
						<div className="space-y-12">
							{/* Mobile Preview */}
							<div className="flex flex-col items-center">
								<div className="text-center mb-6">
									<h3 className="text-lg font-semibold text-slate-900">
										Mobil Görünüm
									</h3>
									<p className="text-sm text-slate-500">
										Formunuz telefonda böyle görünecek
									</p>
								</div>
								<PhoneMockup>
									<div>
										{/* Simplified Mobile Banner */}
										<div className="bg-slate-50 border-b border-slate-200 px-4 py-4">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 rounded-xl border border-slate-200 bg-white grid place-items-center shadow-sm">
													<img
														src="/gdg-logo.png"
														alt="GDG"
														className="h-6 w-6 object-contain"
													/>
												</div>
												<div>
													<p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">
														GDG on Campus
													</p>
													<p className="text-sm font-bold text-slate-900">
														Yaşar Üniversitesi
													</p>
												</div>
											</div>
											<div className="mt-2 flex items-center gap-1">
												<span className="h-1 w-1 rounded-full bg-[#4285F4]" />
												<span className="h-1 w-1 rounded-full bg-[#EA4335]" />
												<span className="h-1 w-1 rounded-full bg-[#FBBC04]" />
												<span className="h-1 w-1 rounded-full bg-[#34A853]" />
											</div>
										</div>
										<div className="px-4 pt-4 pb-3 border-b border-gray-100">
											<h1 className="text-base font-bold text-gray-900 font-display tracking-tight">
												{previewForm.title}
											</h1>
											{previewForm.description && (
												<p className="mt-1 text-xs text-gray-500 whitespace-pre-wrap leading-relaxed">
													{previewForm.description}
												</p>
											)}
										</div>
										<div className="px-4 py-4">
											<div className="mb-4">
												<label className="block text-xs font-medium text-gray-700 mb-1 font-display">
													E-posta <span className="text-red-500 ml-1">*</span>
												</label>
												<input
													type="email"
													disabled
													placeholder="E-posta adresiniz"
													className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs bg-gray-50 text-gray-400"
												/>
											</div>
											<div className="space-y-4">
												{previewForm.questions.map((field) => (
													<div key={field.field_id} className="text-sm">
														<FieldRenderer
															field={field}
															registration={register(field.field_id)}
															error={
																(errors as FieldErrors<FormValues>)[
																	field.field_id
																] as FieldError | undefined
															}
														/>
													</div>
												))}
											</div>
											{previewForm.questions.length === 0 && (
												<div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center">
													<p className="text-xs text-gray-500">
														Henüz alan eklenmedi.
													</p>
												</div>
											)}
											<div className="pt-4">
												<button
													type="button"
													disabled
													className="w-full py-2.5 bg-[#4285F4] text-white text-sm font-semibold rounded-lg opacity-50 cursor-not-allowed"
												>
													Gönder
												</button>
											</div>
										</div>
									</div>
								</PhoneMockup>
							</div>

							{/* Divider */}
							<div className="flex items-center gap-4">
								<div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
								<span className="text-xs text-slate-400 font-medium">
									WEB GÖRÜNÜMÜ
								</span>
								<div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
							</div>

							{/* Web Preview */}
							<div>
								<div className="text-center mb-6">
									<h3 className="text-lg font-semibold text-slate-900">
										Masaüstü Görünüm
									</h3>
									<p className="text-sm text-slate-500">
										Formunuz bilgisayarda böyle görünecek
									</p>
								</div>
								<div className="flex items-center justify-center">
									<div className="w-full max-w-2xl">
										<div className="rounded-2xl shadow-lg border border-gray-200 overflow-hidden bg-white">
											<Banner />

											<div className="px-8 pt-6 pb-4 border-b border-gray-100">
												<h1 className="text-2xl font-bold text-gray-900 font-display tracking-tight">
													{previewForm.title}
												</h1>
												{previewForm.description && (
													<p className="mt-2 text-sm text-gray-500 whitespace-pre-wrap leading-relaxed">
														{previewForm.description}
													</p>
												)}
											</div>

											<div className="px-8 py-6">
												<div className="mb-6">
													<label className="block text-sm font-medium text-gray-700 mb-1 font-display">
														E-posta <span className="text-red-500 ml-1">*</span>
													</label>
													<input
														type="email"
														disabled
														placeholder="E-posta adresiniz"
														className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm bg-gray-50 text-gray-400"
													/>
													<p className="mt-2 text-xs text-gray-500">
														Önizleme modunda e-posta devre dışıdır.
													</p>
												</div>

												<div className="space-y-6">
													{previewForm.questions.map((field) => (
														<FieldRenderer
															key={field.field_id}
															field={field}
															registration={register(field.field_id)}
															error={
																(errors as FieldErrors<FormValues>)[
																	field.field_id
																] as FieldError | undefined
															}
														/>
													))}
												</div>

												{previewForm.questions.length === 0 && (
													<div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
														<p className="text-sm text-gray-500">
															Henüz alan eklenmedi. "Düzenle" moduna geçerek
															alan ekleyin.
														</p>
													</div>
												)}

												<div className="pt-6 flex flex-col sm:flex-row gap-3">
													<button
														type="button"
														disabled
														className="flex-1 py-3 bg-[#4285F4] text-white font-semibold rounded-lg opacity-50 cursor-not-allowed"
													>
														Gönder (Önizleme)
													</button>
													<button
														type="button"
														disabled
														className="flex-1 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 opacity-50 cursor-not-allowed"
													>
														Formu Temizle
													</button>
												</div>
											</div>
										</div>
										<p className="mt-8 text-center text-xs text-gray-500">
											<span className="font-medium">
												GDG on Campus Yaşar Üniversitesi
											</span>{" "}
											tarafından geliştirilmiştir.
										</p>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</AdminPasswordGate>
	);
};

export default FormEditorPage;
