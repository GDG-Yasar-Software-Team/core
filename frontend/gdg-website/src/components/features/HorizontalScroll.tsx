import type React from "react";
import { useRef, useEffect } from "react";
import "./HorizontalScroll.css";

export interface HorizontalScrollProps {
	children: React.ReactNode;
	className?: string;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
	children,
	className = "",
}) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const scrollContainer = scrollRef.current;
		if (!scrollContainer) return;

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft") {
				scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
			} else if (event.key === "ArrowRight") {
				scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
			}
		};

		scrollContainer.addEventListener("keydown", handleKeyDown);
		return () => scrollContainer.removeEventListener("keydown", handleKeyDown);
	}, []);

	return (
		<div
			ref={scrollRef}
			className={`horizontal-scroll ${className}`}
			tabIndex={0}
			role="region"
			aria-label="Scrollable content"
		>
			{children}
		</div>
	);
};
