import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface SelectInputProps {
	id: string;
	label: string;
	placeholder?: string;
	required: boolean;
	options: string[];
	registration: UseFormRegisterReturn;
	error?: FieldError;
}

const SelectInput = ({
	id,
	label,
	placeholder,
	required,
	options,
	registration,
	error,
}: SelectInputProps) => (
	<div>
		<label
			htmlFor={id}
			className="block text-sm font-medium text-gray-700 mb-1"
		>
			{label}
			{required && <span className="text-red-500 ml-1">*</span>}
		</label>
		<select
			id={id}
			defaultValue=""
			className={`w-full rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 appearance-none bg-white ${
				error
					? "border-red-400 focus:ring-red-200"
					: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
			}`}
			{...registration}
		>
			<option value="" disabled>
				{placeholder || "Seçiniz..."}
			</option>
			{options.map((option) => (
				<option key={option} value={option}>
					{option}
				</option>
			))}
		</select>
		{error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
	</div>
);

export default SelectInput;
