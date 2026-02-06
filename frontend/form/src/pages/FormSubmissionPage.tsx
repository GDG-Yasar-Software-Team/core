import React, { useState } from "react";
import type { FormResponse, FormFieldSchema } from "../types";
import "./FormSubmissionPage.css";

interface FormFieldInputProps {
	field: FormFieldSchema;
	value: string | string[];
	onChange: (value: string | string[]) => void;
}

const FormFieldInput: React.FC<FormFieldInputProps> = ({
	field,
	value,
	onChange,
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

	switch (field.fieldType) {
		case "text":
			return (
				<input
					type="text"
					className="form-input"
					placeholder={field.placeholder || ""}
					value={typeof value === "string" ? value : ""}
					onChange={handleChange}
				/>
			);

		case "textarea":
			return (
				<textarea
					className="form-textarea"
					placeholder={field.placeholder || ""}
					value={typeof value === "string" ? value : ""}
					onChange={handleChange}
					rows={5}
				/>
			);

		case "select":
			return (
				<select
					className="form-select"
					value={typeof value === "string" ? value : ""}
					onChange={handleChange}
				>
					<option value="">Seçiniz</option>
					{field.options?.map((option: string) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			);

		case "radio":
			return (
				<div className="radio-group">
					{field.options?.map((option: string) => (
						<label key={option} className="radio-label">
							<input
								type="radio"
								name={field.fieldId}
								value={option}
								checked={value === option}
								onChange={() => handleRadioChange(option)}
							/>
							<span>{option}</span>
						</label>
					))}
				</div>
			);

		case "checkbox":
			return (
				<div className="checkbox-group">
					{field.options?.map((option: string) => (
						<label key={option} className="checkbox-label">
							<input
								type="checkbox"
								name={field.fieldId}
								value={option}
								checked={Array.isArray(value) && value.includes(option)}
								onChange={handleChange}
							/>
							<span>{option}</span>
						</label>
					))}
				</div>
			);

		default:
			return null;
	}
};

interface FormSubmissionPageProps {
	form: FormResponse;
}

const FormSubmissionPage: React.FC<FormSubmissionPageProps> = ({ form }) => {
	const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

	const handleFieldChange = (fieldId: string, value: string | string[]) => {
		setAnswers((prev: Record<string, string | string[]>) => ({
			...prev,
			[fieldId]: value,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// TODO: Submit to backend
		console.log("Form submission:", {
			formId: form.id,
			answers,
			respondentEmail: "", // TODO: Get from user input
			respondentName: "", // TODO: Get from user input
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
			"#4285F4", // Blue
			"#EA4335", // Red
			"#FBBC04", // Yellow
			"#34A853", // Green
			"#9C27B0", // Purple
			"#FF9800", // Orange
		];
		return colors[index % colors.length];
	};

	return (
		<div className="form-submission-page">
			{/* Form Container */}
			<main className="form-container">
				{/* Form Header Card */}
				<div className="form-header-card">
					<div className="gdg-logo">
						<img
							src="https://res.cloudinary.com/startup-grind/image/upload/c_fill,dpr_2.0,f_auto,g_center,h_1080,q_100,w_1080/v1/gcs/platform-data-goog/events/gdg_1ue3eTp.jpg"
							alt="GDG on Campus"
							className="logo-image"
						/>
					</div>
					<h1 className="form-title">{form.title}</h1>
					{form.description && (
						<p className="form-description">{form.description}</p>
					)}
					<div className="required-indicator">
						<span className="required-text">* Zorunlu</span>
					</div>
				</div>

				{/* Form Fields */}
				<form onSubmit={handleSubmit} className="form-fields">
					{form.questions.map((field, index) => (
						<div
							key={field.fieldId}
							className="form-field-wrapper"
							style={{
								borderLeftColor: getFieldBorderColor(index),
							}}
						>
							<label className="form-label">
								{field.label}
								{field.required && <span className="required-asterisk">*</span>}
							</label>
							<FormFieldInput
								field={field}
								value={
									answers[field.fieldId] ??
									(field.fieldType === "checkbox" ? [] : "")
								}
								onChange={(value) => handleFieldChange(field.fieldId, value)}
							/>
						</div>
					))}

					{/* Action Buttons */}
					<div className="form-actions">
						<button type="submit" className="btn btn-primary">
							Gönder
						</button>
						<button
							type="button"
							className="btn btn-secondary"
							onClick={handleClearForm}
						>
							Formu Temizle
						</button>
					</div>
				</form>
			</main>
		</div>
	);
};

export default FormSubmissionPage;
