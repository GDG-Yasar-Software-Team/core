import type { FieldError, UseFormRegisterReturn } from "react-hook-form";
import type { FormFieldSchema } from "../types";
import CheckboxInput from "./CheckboxInput";
import DateInput from "./DateInput";
import NumberInput from "./NumberInput";
import RadioInput from "./RadioInput";
import SelectInput from "./SelectInput";
import TextArea from "./TextArea";
import TextInput from "./TextInput";

interface FieldRendererProps {
	field: FormFieldSchema;
	registration: UseFormRegisterReturn;
	error?: FieldError;
}

const FieldRenderer = ({ field, registration, error }: FieldRendererProps) => {
	switch (field.fieldType) {
		case "text":
			return (
				<TextInput
					id={field.fieldId}
					label={field.label}
					placeholder={field.placeholder}
					required={field.required}
					registration={registration}
					error={error}
				/>
			);
		case "textarea":
			return (
				<TextArea
					id={field.fieldId}
					label={field.label}
					placeholder={field.placeholder}
					required={field.required}
					registration={registration}
					error={error}
				/>
			);
		case "number":
			return (
				<NumberInput
					id={field.fieldId}
					label={field.label}
					placeholder={field.placeholder}
					required={field.required}
					registration={registration}
					error={error}
				/>
			);
		case "select":
		case "multiselect":
			return (
				<SelectInput
					id={field.fieldId}
					label={field.label}
					placeholder={field.placeholder}
					required={field.required}
					options={field.options || []}
					registration={registration}
					error={error}
				/>
			);
		case "radio":
			return (
				<RadioInput
					id={field.fieldId}
					label={field.label}
					required={field.required}
					options={field.options || []}
					registration={registration}
					error={error}
				/>
			);
		case "checkbox":
			return (
				<CheckboxInput
					label={field.label}
					required={field.required}
					options={field.options || []}
					registration={registration}
					error={error}
				/>
			);
		case "date":
			return (
				<DateInput
					id={field.fieldId}
					label={field.label}
					required={field.required}
					registration={registration}
					error={error}
				/>
			);
		default:
			return null;
	}
};

export default FieldRenderer;
