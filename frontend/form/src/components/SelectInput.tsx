import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface SelectInputProps {
	id: string;
	label: string;
	placeholder?: string;
	required: boolean;
	options: string[];
	registration: UseFormRegisterReturn;
	error?: FieldError;
	multiple?: boolean;
}

const SelectInput = ({
	id,
	label,
	placeholder,
	required,
	options,
	registration,
	error,
	multiple = false,
}: SelectInputProps) => (
	<div>
		<label
			htmlFor={id}
			className="block text-sm font-medium text-gray-700 mb-1 font-display"
		>
			{label}
			{required && <span className="text-red-500 ml-1">*</span>}
		</label>
		<select
			id={id}
			multiple={multiple}
			className={`w-full rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 bg-white ${
				multiple ? "min-h-[120px]" : "appearance-none"
			} ${
				error
					? "border-red-400 focus:ring-red-200"
					: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
			}`}
			{...registration}
		>
			{!multiple && (
				<option value="" disabled>
					{placeholder || "Seçiniz..."}
				</option>
			)}
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
		{multiple && (
			<p className="mt-1 text-xs text-gray-500">
				Birden fazla seçenek için Ctrl/Cmd tuşunu kullanın.
			</p>
		)}
		{error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
	</div>
);

export default SelectInput;
