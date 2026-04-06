import type React from "react";

export interface CardProps {
	variant: "elevated" | "filled" | "outlined";
	clickable?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
}

const variantClasses: Record<CardProps["variant"], string> = {
	elevated: "bg-[var(--color-surface)] shadow-[var(--elevation-1)] border-0",
	filled: "bg-[var(--color-surface-variant)] shadow-none border-0",
	outlined:
		"bg-[var(--color-surface)] shadow-none border border-[var(--color-on-surface-variant)]",
};

const clickableClasses: Record<CardProps["variant"], string> = {
	elevated:
		"hover:cursor-pointer hover:shadow-[var(--elevation-2)] active:shadow-[var(--elevation-1)]",
	filled: "hover:cursor-pointer hover:bg-[#eeeeee] active:bg-[#e8e8e8]",
	outlined:
		"hover:cursor-pointer hover:bg-[var(--color-hover)] active:bg-[var(--color-active)]",
};

export const Card: React.FC<CardProps> = ({
	variant,
	clickable = false,
	onClick,
	children,
	className = "",
}) => {
	const classNames = [
		"block rounded-[var(--radius-lg)] transition-all duration-200 ease-in-out relative overflow-hidden",
		"focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-blue)] focus-visible:outline-offset-2",
		variantClasses[variant],
		clickable && clickableClasses[variant],
		clickable && "select-none",
		className,
	]
		.filter(Boolean)
		.join(" ");

	const handleClick = () => {
		if (clickable && onClick) {
			onClick();
		}
	};

	const handleKeyDown = (event: React.KeyboardEvent) => {
		if (clickable && onClick && (event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			onClick();
		}
	};

	return (
		<div
			className={classNames}
			onClick={handleClick}
			onKeyDown={handleKeyDown}
			role={clickable ? "button" : undefined}
			tabIndex={clickable ? 0 : undefined}
		>
			{children}
		</div>
	);
};
