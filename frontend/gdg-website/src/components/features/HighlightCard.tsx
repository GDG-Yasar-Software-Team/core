import type React from "react";
import type { Highlight } from "../../types";
import "./HighlightCard.css";

export interface HighlightCardProps {
	highlight: Highlight;
	className?: string;
}

export const HighlightCard: React.FC<HighlightCardProps> = ({
	highlight,
	className = "",
}) => {
	return (
		<div className={`highlight-card ${className}`}>
			<div className="highlight-card__icon">{highlight.icon}</div>
			<h3 className="highlight-card__title">{highlight.title}</h3>
			<p className="highlight-card__description">{highlight.description}</p>
		</div>
	);
};
