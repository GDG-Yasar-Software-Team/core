import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import "./Accordion.css";

export interface AccordionItem {
	id: string;
	question: string;
	answer: string;
}

export interface AccordionProps {
	items: AccordionItem[];
	allowMultiple?: boolean;
}

export const Accordion: React.FC<AccordionProps> = ({
	items,
	allowMultiple = false,
}) => {
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	const toggleItem = (id: string) => {
		setExpandedIds((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				if (!allowMultiple) {
					newSet.clear();
				}
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			toggleItem(id);
		}
	};

	return (
		<div className="accordion">
			{items.map((item) => {
				const isExpanded = expandedIds.has(item.id);
				return (
					<div key={item.id} className="accordion__item">
						<button
							type="button"
							className="accordion__button"
							onClick={() => toggleItem(item.id)}
							onKeyDown={(e) => handleKeyDown(e, item.id)}
							aria-expanded={isExpanded}
							aria-controls={`panel-${item.id}`}
							id={`button-${item.id}`}
						>
							<span className="accordion__question">{item.question}</span>
							<motion.span
								className="accordion__chevron"
								animate={{ rotate: isExpanded ? 180 : 0 }}
								transition={{ duration: 0.3, ease: "easeInOut" }}
								aria-hidden="true"
							>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<path
										d="M7 10L12 15L17 10"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
							</motion.span>
						</button>
						<AnimatePresence initial={false}>
							{isExpanded && (
								<motion.div
									id={`panel-${item.id}`}
									role="region"
									aria-labelledby={`button-${item.id}`}
									className="accordion__panel"
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: "auto", opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.3, ease: "easeInOut" }}
								>
									<div className="accordion__content">{item.answer}</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</div>
	);
};
