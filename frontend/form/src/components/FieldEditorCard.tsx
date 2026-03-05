import { useState } from "react";
import type { FieldType, FormFieldSchema } from "../types";
import FieldTypeSelect from "./FieldTypeSelect";

const TYPES_WITH_OPTIONS: FieldType[] = ["select", "multiselect", "radio"];

const DEPARTMENT_OPTIONS = [
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
];

function slugify(text: string): string {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9\s_-]/g, "")
		.replace(/\s+/g, "_")
		.replace(/-+/g, "_")
		.replace(/_+/g, "_")
		.slice(0, 50);
}

interface FieldEditorCardProps {
	field: FormFieldSchema;
	index: number;
	totalFields: number;
	isNewField: boolean;
	allFieldIds: string[];
	onChange: (field: FormFieldSchema) => void;
	onMoveUp: () => void;
	onMoveDown: () => void;
	onRemove: () => void;
}

const FieldEditorCard = ({
	field,
	index,
	totalFields,
	isNewField,
	allFieldIds,
	onChange,
	onMoveUp,
	onMoveDown,
	onRemove,
}: FieldEditorCardProps) => {
	const [isExpanded, setIsExpanded] = useState(true);
	const [labelValue, setLabelValue] = useState(field.label);
	const [options, setOptions] = useState<string[]>(
		field.options?.length ? field.options : [""],
	);

	const showOptions = TYPES_WITH_OPTIONS.includes(field.field_type);

	const updateField = (updates: Partial<FormFieldSchema>) => {
		onChange({ ...field, ...updates });
	};

	const handleFieldTypeChange = (value: FieldType) => {
		if (value === "department") {
			setOptions(DEPARTMENT_OPTIONS);
			updateField({ field_type: value, options: DEPARTMENT_OPTIONS });
		} else if (field.field_type === "department") {
			setOptions([""]);
			updateField({ field_type: value, options: undefined });
		} else {
			updateField({ field_type: value });
		}
	};

	const handleLabelChange = (label: string) => {
		setLabelValue(label);
		const updates: Partial<FormFieldSchema> = { label };
		if (isNewField) {
			updates.field_id = slugify(label);
		}
		updateField(updates);
	};

	const handleOptionChange = (i: number, value: string) => {
		const next = options.map((o, idx) => (idx === i ? value : o));
		setOptions(next);
		const filled = next.filter((o) => o.trim().length > 0);
		updateField({ options: filled.length > 0 ? filled : undefined });
	};

	const handleOptionAdd = () => setOptions((prev) => [...prev, ""]);

	const handleOptionRemove = (i: number) => {
		const next = options.filter((_, idx) => idx !== i);
		const safe = next.length > 0 ? next : [""];
		setOptions(safe);
		const filled = safe.filter((o) => o.trim().length > 0);
		updateField({ options: filled.length > 0 ? filled : undefined });
	};

	const handleValidationChange = (
		key: keyof NonNullable<FormFieldSchema["validation"]>,
		value: string,
	) => {
		const numValue = value === "" ? undefined : Number(value);
		const currentValidation = field.validation ?? {};
		const newValidation = { ...currentValidation, [key]: numValue };

		const hasValues = Object.values(newValidation).some(
			(v) => v !== undefined && v !== "",
		);
		updateField({ validation: hasValues ? newValidation : undefined });
	};

	const handlePatternChange = (pattern: string) => {
		const currentValidation = field.validation ?? {};
		const newValidation = {
			...currentValidation,
			pattern: pattern || undefined,
		};

		const hasValues = Object.values(newValidation).some(
			(v) => v !== undefined && v !== "",
		);
		updateField({ validation: hasValues ? newValidation : undefined });
	};

	const handleConditionChange = (
		key: "depends_on" | "values",
		value: string,
	) => {
		const currentCondition = field.condition ?? { depends_on: "", values: [] };

		if (key === "depends_on") {
			if (!value) {
				updateField({ condition: undefined });
				return;
			}
			updateField({
				condition: { ...currentCondition, depends_on: value },
			});
		} else {
			const values = value
				.split(",")
				.map((v) => v.trim())
				.filter((v) => v.length > 0);
			if (values.length === 0 && !currentCondition.depends_on) {
				updateField({ condition: undefined });
				return;
			}
			updateField({
				condition: { ...currentCondition, values },
			});
		}
	};

	const otherFieldIds = allFieldIds.filter((id) => id !== field.field_id);

	return (
		<div className="rounded-xl border border-slate-200 bg-white shadow-sm">
			<div
				className="flex cursor-pointer items-center justify-between px-4 py-3"
				onClick={() => setIsExpanded(!isExpanded)}
				onKeyDown={(e) => e.key === "Enter" && setIsExpanded(!isExpanded)}
			>
				<div className="flex items-center gap-3">
					<span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-medium text-slate-600">
						{index + 1}
					</span>
					<span className="font-medium text-slate-900">
						{field.label || "Başlıksız Alan"}
					</span>
					{field.required && (
						<span className="rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-600">
							Zorunlu
						</span>
					)}
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onMoveUp();
						}}
						disabled={index === 0}
						className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
						title="Yukarı Taşı"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M5 15l7-7 7 7"
							/>
						</svg>
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onMoveDown();
						}}
						disabled={index === totalFields - 1}
						className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
						title="Aşağı Taşı"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onRemove();
						}}
						className="rounded p-1 text-red-400 hover:bg-red-50 hover:text-red-600"
						title="Alanı Sil"
					>
						<svg
							className="h-4 w-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
					<svg
						className={`h-5 w-5 text-slate-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M19 9l-7 7-7-7"
						/>
					</svg>
				</div>
			</div>

			{isExpanded && (
				<div className="border-t border-slate-100 px-4 py-4 space-y-4">
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="block text-sm font-medium text-slate-700">
								Alan Etiketi <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
							value={labelValue}
								onChange={(e) => handleLabelChange(e.target.value)}
								className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
								placeholder="Örn: Ad Soyad"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700">
								Alan Tipi <span className="text-red-500">*</span>
							</label>
							<FieldTypeSelect
								value={field.field_type}
								onChange={handleFieldTypeChange}
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="block text-sm font-medium text-slate-700">
								Alan ID {isNewField && "(otomatik)"}
							</label>
							<input
								type="text"
								value={field.field_id}
								onChange={(e) => updateField({ field_id: e.target.value })}
								disabled={!isNewField}
								className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:bg-slate-50 disabled:text-slate-500"
								placeholder="alan_id"
							/>
						</div>
						<div>
							<label className="block text-sm font-medium text-slate-700">
								Placeholder
							</label>
							<input
								type="text"
								value={field.placeholder ?? ""}
								onChange={(e) =>
									updateField({ placeholder: e.target.value || undefined })
								}
								className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
								placeholder="Placeholder metni..."
							/>
						</div>
					</div>

					<div className="flex items-center gap-2">
						<input
							type="checkbox"
							id={`required-${field.field_id}`}
							checked={field.required}
							onChange={(e) => updateField({ required: e.target.checked })}
							className="h-4 w-4 rounded border-slate-300 text-blue-500 focus:ring-blue-200"
						/>
						<label
							htmlFor={`required-${field.field_id}`}
							className="text-sm font-medium text-slate-700"
						>
							Zorunlu Alan
						</label>
					</div>

					{showOptions && (
						<div>
							<label className="block text-sm font-medium text-slate-700">
								Seçenekler
							</label>
							<div className="mt-1 space-y-2">
								{options.map((opt, i) => (
									<div key={i} className="flex items-center gap-2">
										<input
											type="text"
											value={opt}
											onChange={(e) => handleOptionChange(i, e.target.value)}
											className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
											placeholder={`Seçenek ${i + 1}`}
										/>
										<button
											type="button"
											onClick={() => handleOptionRemove(i)}
											disabled={options.length === 1}
											className="rounded p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30 disabled:hover:bg-transparent"
										>
											<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									</div>
								))}
								<button
									type="button"
									onClick={handleOptionAdd}
									className="mt-1 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
									</svg>
									Seçenek Ekle
								</button>
							</div>
						</div>
					)}

					<details className="rounded-lg border border-slate-200 bg-slate-50">
						<summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700">
							Doğrulama Kuralları
						</summary>
						<div className="space-y-3 px-3 pb-3 pt-1">
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs text-slate-600">
										Min Uzunluk
									</label>
									<input
										type="number"
										value={field.validation?.min_length ?? ""}
										onChange={(e) =>
											handleValidationChange("min_length", e.target.value)
										}
										className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
									/>
								</div>
								<div>
									<label className="block text-xs text-slate-600">
										Max Uzunluk
									</label>
									<input
										type="number"
										value={field.validation?.max_length ?? ""}
										onChange={(e) =>
											handleValidationChange("max_length", e.target.value)
										}
										className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs text-slate-600">
										Min Değer
									</label>
									<input
										type="number"
										value={field.validation?.min_value ?? ""}
										onChange={(e) =>
											handleValidationChange("min_value", e.target.value)
										}
										className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
									/>
								</div>
								<div>
									<label className="block text-xs text-slate-600">
										Max Değer
									</label>
									<input
										type="number"
										value={field.validation?.max_value ?? ""}
										onChange={(e) =>
											handleValidationChange("max_value", e.target.value)
										}
										className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
									/>
								</div>
							</div>
							<div>
								<label className="block text-xs text-slate-600">
									Regex Deseni
								</label>
								<input
									type="text"
									value={field.validation?.pattern ?? ""}
									onChange={(e) => handlePatternChange(e.target.value)}
									className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm font-mono focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
									placeholder="^[A-Z].*"
								/>
							</div>
						</div>
					</details>

					{otherFieldIds.length > 0 && (
						<details className="rounded-lg border border-slate-200 bg-slate-50">
							<summary className="cursor-pointer px-3 py-2 text-sm font-medium text-slate-700">
								Koşullu Görünürlük
							</summary>
							<div className="space-y-3 px-3 pb-3 pt-1">
								<div>
									<label className="block text-xs text-slate-600">
										Bağlı Olduğu Alan
									</label>
									<select
										value={field.condition?.depends_on ?? ""}
										onChange={(e) =>
											handleConditionChange("depends_on", e.target.value)
										}
										className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
									>
										<option value="">Yok</option>
										{otherFieldIds.map((id) => (
											<option key={id} value={id}>
												{id}
											</option>
										))}
									</select>
								</div>
								{field.condition?.depends_on && (
									<div>
										<label className="block text-xs text-slate-600">
											Göstermek İçin Gerekli Değerler (virgülle ayırın)
										</label>
										<input
											type="text"
											value={field.condition?.values?.join(", ") ?? ""}
											onChange={(e) =>
												handleConditionChange("values", e.target.value)
											}
											className="mt-1 w-full rounded border border-slate-300 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200"
											placeholder="değer1, değer2"
										/>
									</div>
								)}
							</div>
						</details>
					)}
				</div>
			)}
		</div>
	);
};

export default FieldEditorCard;
