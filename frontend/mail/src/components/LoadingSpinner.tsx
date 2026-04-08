interface LoadingSpinnerProps {
	size?: "sm" | "md" | "lg";
	className?: string;
}

const sizeClasses = {
	sm: "h-4 w-4 border-2",
	md: "h-8 w-8 border-2",
	lg: "h-12 w-12 border-4",
};

export default function LoadingSpinner({
	size = "md",
	className = "",
}: LoadingSpinnerProps) {
	return (
		<output
			className={`block animate-spin rounded-full border-gray-300 border-t-google-blue ${sizeClasses[size]} ${className}`}
			aria-label="Yükleniyor"
		/>
	);
}
