import type React from "react";
import type { Highlight } from "../../types";

export interface HighlightCardProps {
	highlight: Highlight;
	className?: string;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
	highlight,
	className = "",
}) => {
	return (
		<div
			className={`flex flex-col items-center text-center bg-[var(--surface)] rounded-[var(--border-radius-md)] p-8 shadow-[var(--elevation-1)] transition-all duration-300 ease-in-out hover:shadow-[var(--elevation-2)] hover:-translate-y-1 ${className}`}
		>
			<div className="text-[48px] mb-4">{highlight.icon}</div>
			<h3 className="text-[length:var(--font-size-xl)] font-bold text-[var(--on-surface)] mb-2 m-0">
				{highlight.title}
			</h3>
			<p className="text-[length:var(--font-size-md)] text-[var(--on-surface-variant)] m-0 leading-relaxed">
				{highlight.description}
			</p>
		</div>
	);
};
