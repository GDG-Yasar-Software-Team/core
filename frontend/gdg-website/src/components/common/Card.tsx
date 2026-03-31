import type React from "react";
import "./Card.css";

export interface CardProps {
	variant: "elevated" | "filled" | "outlined";
	clickable?: boolean;
	onClick?: () => void;
	children: React.ReactNode;
	className?: string;
}

export const Card: React.FC<CardProps> = ({
	variant,
	clickable = false,
	onClick,
	children,
	className = "",
}) => {
	const classNames = [
		"card",
		`card--${variant}`,
		clickable && "card--clickable",
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
