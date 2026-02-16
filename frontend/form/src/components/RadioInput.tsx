import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface RadioInputProps {
	id: string;
	label: string;
	required: boolean;
	options: string[];
	registration: UseFormRegisterReturn;
	error?: FieldError;
}

const RadioInput = ({
	label,
	required,
	options,
	registration,
	error,
}: RadioInputProps) => (
	<div>
		<fieldset>
			<legend className="block text-sm font-medium text-gray-700 mb-2">
				{label}
				{required && <span className="text-red-500 ml-1">*</span>}
			</legend>
			<div className="space-y-2">
				{options.map((option) => (
					<label
						key={option}
						className="flex items-center gap-2 cursor-pointer text-sm text-gray-700"
					>
						<input
							type="radio"
							value={option}
							className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
							{...registration}
						/>
						{option}
					</label>
				))}
			</div>
		</fieldset>
		{error && (
			<p className="mt-1 text-xs text-red-500">{error.message}</p>
		)}
	</div>
);

export default RadioInput;
