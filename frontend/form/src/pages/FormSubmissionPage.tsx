import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { FormFieldSchema, FormResponse } from "../types";

interface FormFieldInputProps {
	field: FormFieldSchema;
	value: string | string[];
	onChange: (value: string | string[]) => void;
	isFocused: boolean;
	onFocus: () => void;
	onBlur: () => void;
}

const FormFieldInput: React.FC<FormFieldInputProps> = ({
	field,
	value,
	onChange,
	isFocused,
	onFocus,
	onBlur,
}) => {
	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		if (field.fieldType === "checkbox") {
			const checked = (e.target as HTMLInputElement).checked;
			const checkboxValue = (e.target as HTMLInputElement).value;
			const currentValues = Array.isArray(value) ? value : [];
			const newValues = checked
				? [...currentValues, checkboxValue]
				: currentValues.filter((v) => v !== checkboxValue);
			onChange(newValues);
		} else {
			onChange(e.target.value);
		}
	};

	const handleRadioChange = (optionValue: string) => {
		onChange(optionValue);
	};

	if (field.fieldType === "text") {
		return (
			<input
				type="text"
				className="w-full px-[18px] py-3.5 text-[15px] rounded-[24px] border border-[#dadce0] bg-[#f8f9fa] transition-all duration-300 ease-in-out focus:outline-none focus:bg-white focus:border-[#673ab7] focus:shadow-[0_0_0_4px_rgba(103,58,183,0.2)] focus:scale-[1.01]"
				placeholder={field.placeholder || ""}
				value={typeof value === "string" ? value : ""}
				onChange={handleChange}
				onFocus={onFocus}
				onBlur={onBlur}
			/>
		);
	}

	if (field.fieldType === "textarea") {
		return (
			<textarea
				className="w-full px-[18px] py-3.5 text-[15px] rounded-[24px] border border-[#dadce0] bg-[#f8f9fa] min-h-[120px] resize-y transition-all duration-300 ease-in-out focus:outline-none focus:bg-white focus:border-[#673ab7] focus:shadow-[0_0_0_4px_rgba(103,58,183,0.2)] focus:scale-[1.01]"
				placeholder={field.placeholder || ""}
				value={typeof value === "string" ? value : ""}
				onChange={handleChange}
				onFocus={onFocus}
				onBlur={onBlur}
				rows={5}
			/>
		);
	}

	if (field.fieldType === "radio") {
		return (
			<div className="flex flex-col gap-3 mt-2">
				{field.options?.map((option: string) => (
					<label
						key={option}
						className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#673ab7]/5 hover:scale-[1.02]"
					>
						<input
							type="radio"
							name={field.fieldId}
							value={option}
							checked={value === option}
							onChange={() => handleRadioChange(option)}
							onFocus={onFocus}
							onBlur={onBlur}
							className="w-4 h-4 accent-[#673ab7] transition-transform duration-200"
						/>
						<span className="text-[15px]">{option}</span>
					</label>
				))}
			</div>
		);
	}

	if (field.fieldType === "checkbox") {
		return (
			<div className="flex flex-col gap-3 mt-2">
				{field.options?.map((option: string) => (
					<label
						key={option}
						className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg cursor-pointer transition-all duration-200 hover:bg-[#673ab7]/5 hover:scale-[1.02]"
					>
						<input
							type="checkbox"
							name={field.fieldId}
							value={option}
							checked={Array.isArray(value) && value.includes(option)}
							onChange={handleChange}
							onFocus={onFocus}
							onBlur={onBlur}
							className="w-4 h-4 accent-[#673ab7] transition-transform duration-200"
						/>
						<span className="text-[15px]">{option}</span>
					</label>
				))}
			</div>
		);
	}

	return null;
};

interface FormSubmissionPageProps {
	form: FormResponse;
}

const FormSubmissionPage: React.FC<FormSubmissionPageProps> = ({ form }) => {
	const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
	const [focusedField, setFocusedField] = useState<string | null>(null);
	const [isSticky, setIsSticky] = useState(false);
	const formActionsRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleScroll = () => {
			if (formActionsRef.current) {
				const rect = formActionsRef.current.getBoundingClientRect();
				const windowHeight = window.innerHeight;
				setIsSticky(rect.top > windowHeight - 100);
			}
		};

		window.addEventListener("scroll", handleScroll);
		handleScroll();

		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handleFieldChange = (fieldId: string, value: string | string[]) => {
		setAnswers((prev: Record<string, string | string[]>) => ({
			...prev,
			[fieldId]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form submission:", {
			formId: form.id,
			answers,
			respondentEmail: "",
			respondentName: "",
		});
		alert(
			"Form başarıyla gönderildi! (Backend entegrasyonu yakında eklenecek)",
		);
	};

	const handleClearForm = () => {
		setAnswers({});
	};

	const getFieldBorderColor = (index: number): string => {
		const colors = [
			"#4285F4",
			"#EA4335",
			"#FBBC04",
			"#34A853",
			"#9C27B0",
			"#FF9800",
		];
		return colors[index % colors.length];
	};

	return (
		<div className="min-h-screen font-['Roboto',sans-serif] bg-[#f4f7fc] pb-32">
			<main className="max-w-[640px] mx-auto px-4 pt-3">
				<div className="relative bg-white rounded-2xl p-8 mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border-l-[6px] border-l-[#673ab7] md:p-5">
					<div className="absolute top-6 right-6">
						<img
							src="https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_1080,q_100,w_1080/v1/gcs/platform-data-goog/events/gdg_1ue3eTp.jpg"
							alt="GDG on Campus"
							className="h-10"
						/>
					</div>
					<h1 className="text-[32px] font-medium mb-4 pr-20 text-[#1f2937]">
						{form.title}
					</h1>
					{form.description && (
						<p className="text-[15px] text-[#4b5563] leading-[1.6] whitespace-pre-wrap mb-4">
							{form.description}
						</p>
					)}
					<div className="border-t border-black/[0.06] pt-4 mt-4">
						<span className="text-[13px] text-[#d93025] font-medium">
							* Zorunlu
						</span>
					</div>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					{form.questions.map((field, index) => (
						<div
							key={field.fieldId}
							className={`bg-white rounded-2xl p-8 border-l-[6px] shadow-[0_6px_15px_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out md:p-5 ${
								focusedField === field.fieldId
									? "scale-[1.02] shadow-[0_16px_32px_rgba(0,0,0,0.12)] ring-2 ring-[#673ab7]/20"
									: "hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(0,0,0,0.08)]"
							}`}
							style={{
								borderLeftColor: getFieldBorderColor(index),
							}}
						>
							<div className="text-[17px] font-medium mb-5">
								{field.label}
								{field.required && (
									<span className="text-[#d93025] ml-1">*</span>
								)}
							</div>
							<FormFieldInput
								field={field}
								value={
									answers[field.fieldId] ??
									(field.fieldType === "checkbox" ? [] : "")
								}
								onChange={(value) => handleFieldChange(field.fieldId, value)}
								isFocused={focusedField === field.fieldId}
								onFocus={() => setFocusedField(field.fieldId)}
								onBlur={() => setFocusedField(null)}
							/>
						</div>
					))}

					<div ref={formActionsRef} className="flex justify-between mt-8 gap-4">
						<button
							type="submit"
							className="h-12 px-8 rounded-xl font-medium cursor-pointer border-0 bg-[#673ab7] text-white hover:bg-[#5e35b1] transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
						>
							Gönder
						</button>
						<button
							type="button"
							className="h-12 px-8 rounded-xl font-medium cursor-pointer border-0 bg-[#eeeeee] text-[#673ab7] hover:bg-[#e0e0e0] transition-all duration-200 hover:scale-105 active:scale-95"
							onClick={handleClearForm}
						>
							Formu Temizle
						</button>
					</div>
				</form>
			</main>

			{isSticky && (
				<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.1)] z-50 animate-[slideUp_0.3s_ease-out]">
					<div className="max-w-[640px] mx-auto px-4 py-4 flex justify-between gap-4">
						<button
							type="submit"
							onClick={handleSubmit}
							className="flex-1 h-12 px-8 rounded-xl font-medium cursor-pointer border-0 bg-[#673ab7] text-white hover:bg-[#5e35b1] transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/>
							</svg>
							Gönder
						</button>
						<button
							type="button"
							className="h-12 px-8 rounded-xl font-medium cursor-pointer border-0 bg-[#eeeeee] text-[#673ab7] hover:bg-[#e0e0e0] transition-all duration-200 hover:scale-[1.02] active:scale-95"
							onClick={handleClearForm}
						>
							Temizle
						</button>
					</div>
				</div>
			)}

			<style>{`
				@keyframes slideUp {
					from {
						transform: translateY(100%);
						opacity: 0;
					}
					to {
						transform: translateY(0);
						opacity: 1;
					}
				}
			`}</style>
		</div>
	);
};

export default FormSubmissionPage;
