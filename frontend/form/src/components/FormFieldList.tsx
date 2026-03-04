import { useMemo } from "react";
import type { FormFieldSchema } from "../types";
import FieldEditorCard from "./FieldEditorCard";

interface FormFieldListProps {
	fields: FormFieldSchema[];
	existingFieldIds: Set<string>;
	onChange: (fields: FormFieldSchema[]) => void;
}

const FormFieldList = ({
	fields,
	existingFieldIds,
	onChange,
}: FormFieldListProps) => {
	const allFieldIds = useMemo(() => fields.map((f) => f.field_id), [fields]);

	const handleFieldChange = (index: number, updatedField: FormFieldSchema) => {
		const newFields = [...fields];
		newFields[index] = updatedField;
		onChange(newFields);
	};

	const handleMoveUp = (index: number) => {
		if (index === 0) return;
		const newFields = [...fields];
		[newFields[index - 1], newFields[index]] = [
			newFields[index],
			newFields[index - 1],
		];
		onChange(newFields);
	};

	const handleMoveDown = (index: number) => {
		if (index === fields.length - 1) return;
		const newFields = [...fields];
		[newFields[index], newFields[index + 1]] = [
			newFields[index + 1],
			newFields[index],
		];
		onChange(newFields);
	};

	const handleRemove = (index: number) => {
		const newFields = fields.filter((_, i) => i !== index);
		onChange(newFields);
	};

	if (fields.length === 0) {
		return (
			<div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center">
				<p className="text-sm text-slate-500">
					Henüz alan eklenmedi. "Alan Ekle" butonuna tıklayarak başlayın.
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{fields.map((field, index) => (
				<FieldEditorCard
					key={field.field_id || `field-${index}`}
					field={field}
					index={index}
					totalFields={fields.length}
					isNewField={!existingFieldIds.has(field.field_id)}
					allFieldIds={allFieldIds}
					onChange={(updatedField) => handleFieldChange(index, updatedField)}
					onMoveUp={() => handleMoveUp(index)}
					onMoveDown={() => handleMoveDown(index)}
					onRemove={() => handleRemove(index)}
				/>
			))}
		</div>
	);
};

export default FormFieldList;
