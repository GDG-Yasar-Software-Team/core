import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface TextAreaProps {
	id: string;
	label: string;
	placeholder?: string;
	required: boolean;
	registration: UseFormRegisterReturn;
	error?: FieldError;
}

const TextArea = ({
	id,
	label,
	placeholder,
	required,
	registration,
	error,
}: TextAreaProps) => (
	<div>
		<label
			htmlFor={id}
			className="block text-sm font-medium text-gray-700 mb-1"
		>
			{label}
			{required && <span className="text-red-500 ml-1">*</span>}
		</label>
		<textarea
			id={id}
			rows={4}
			placeholder={placeholder}
			className={`w-full rounded-lg border px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 resize-vertical ${
				error
					? "border-red-400 focus:ring-red-200"
					: "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
			}`}
			{...registration}
		/>
		{error && <p className="mt-1 text-xs text-red-500">{error.message}</p>}
	</div>
);

export default TextArea;
