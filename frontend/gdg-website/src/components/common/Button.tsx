import type React from "react";
import "./Button.css";

export interface ButtonProps {
	variant: "filled" | "outlined" | "text";
	size?: "small" | "medium" | "large";
	color?: "primary" | "secondary";
	disabled?: boolean;
	fullWidth?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
	ariaLabel?: string;
	type?: "button" | "submit" | "reset";
}

export const Button: React.FC<ButtonProps> = ({
	variant,
	size = "medium",
	color = "primary",
	disabled = false,
	fullWidth = false,
	onClick,
	children,
	ariaLabel,
	type = "button",
}) => {
	const classNames = [
		"button",
		`button--${variant}`,
		`button--${size}`,
		`button--${color}`,
		fullWidth && "button--full-width",
		disabled && "button--disabled",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<button
			type={type}
			className={classNames}
			onClick={onClick}
			disabled={disabled}
			aria-label={ariaLabel}
		>
			{children}
		</button>
	);
};
