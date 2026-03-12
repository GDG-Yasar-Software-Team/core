import { motion, useInView } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

/** Custom scrollbar styles (webkit-specific) */
const scrollbarStyles: React.CSSProperties = {
	scrollbarWidth: "thin",
	scrollbarColor: "#cbd5e1 #f1f5f9",
};

interface AnimatedItemProps {
	children: React.ReactNode;
	index: number;
	onMouseEnter: () => void;
	onClick: () => void;
}

const AnimatedItem = ({
	children,
	index,
	onMouseEnter,
	onClick,
}: AnimatedItemProps) => {
	const ref = useRef(null);
	const inView = useInView(ref, { amount: 0.5, once: false });
	return (
		<motion.div
			ref={ref}
			data-index={index}
			onMouseEnter={onMouseEnter}
			onClick={onClick}
			initial={{ scale: 0.7, opacity: 0 }}
			animate={inView ? { scale: 1, opacity: 1 } : { scale: 0.7, opacity: 0 }}
			transition={{ duration: 0.2, delay: 0.05 }}
			className="mb-2 cursor-pointer"
		>
			{children}
		</motion.div>
	);
};

export interface AnimatedListItem {
	value: string;
	label: string;
}

interface AnimatedListProps {
	items: AnimatedListItem[];
	selectedValue?: string;
	onItemSelect: (item: AnimatedListItem, index: number) => void;
	showGradients?: boolean;
	enableArrowNavigation?: boolean;
	displayScrollbar?: boolean;
}

const AnimatedList = ({
	items,
	selectedValue,
	onItemSelect,
	showGradients = true,
	enableArrowNavigation = true,
	displayScrollbar = true,
}: AnimatedListProps) => {
	const listRef = useRef<HTMLDivElement>(null);
	const [selectedIndex, setSelectedIndex] = useState(
		items.findIndex((item) => item.value === selectedValue),
	);
	const [keyboardNav, setKeyboardNav] = useState(false);
	const [topGradientOpacity, setTopGradientOpacity] = useState(0);
	const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

	useEffect(() => {
		setSelectedIndex(items.findIndex((item) => item.value === selectedValue));
	}, [selectedValue, items]);

	const handleItemClick = useCallback(
		(item: AnimatedListItem, index: number) => {
			setSelectedIndex(index);
			onItemSelect(item, index);
		},
		[onItemSelect],
	);

	const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
		const { scrollTop, scrollHeight, clientHeight } = e.target as HTMLElement;
		setTopGradientOpacity(Math.min(scrollTop / 50, 1));
		const bottomDistance = scrollHeight - (scrollTop + clientHeight);
		setBottomGradientOpacity(
			scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
		);
	};

	useEffect(() => {
		if (!enableArrowNavigation) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
				e.preventDefault();
				setKeyboardNav(true);
				setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1));
			} else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
				e.preventDefault();
				setKeyboardNav(true);
				setSelectedIndex((prev) => Math.max(prev - 1, 0));
			} else if (e.key === "Enter") {
				if (selectedIndex >= 0 && selectedIndex < items.length) {
					e.preventDefault();
					onItemSelect(items[selectedIndex], selectedIndex);
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [items, selectedIndex, onItemSelect, enableArrowNavigation]);

	useEffect(() => {
		if (!keyboardNav || selectedIndex < 0 || !listRef.current) return;
		const container = listRef.current;
		const selectedItem = container.querySelector(
			`[data-index="${selectedIndex}"]`,
		) as HTMLElement | null;
		if (selectedItem) {
			const extraMargin = 50;
			const containerScrollTop = container.scrollTop;
			const containerHeight = container.clientHeight;
			const itemTop = selectedItem.offsetTop;
			const itemBottom = itemTop + selectedItem.offsetHeight;
			if (itemTop < containerScrollTop + extraMargin) {
				container.scrollTo({ top: itemTop - extraMargin, behavior: "smooth" });
			} else if (
				itemBottom >
				containerScrollTop + containerHeight - extraMargin
			) {
				container.scrollTo({
					top: itemBottom - containerHeight + extraMargin,
					behavior: "smooth",
				});
			}
		}
		setKeyboardNav(false);
	}, [selectedIndex, keyboardNav]);

	return (
		<div className="relative w-full">
			<div
				ref={listRef}
				className={`max-h-[220px] overflow-y-auto p-2 bg-white rounded-lg ${
					!displayScrollbar ? "scrollbar-none" : ""
				}`}
				style={displayScrollbar ? scrollbarStyles : undefined}
				onScroll={handleScroll}
			>
				{items.map((item, index) => (
					<AnimatedItem
						key={item.value}
						index={index}
						onMouseEnter={() => setSelectedIndex(index)}
						onClick={() => handleItemClick(item, index)}
					>
						<div
							className={`px-3 py-2 rounded-md border transition-colors duration-150 ${
								selectedIndex === index
									? "bg-blue-50 border-blue-500"
									: "bg-slate-50 border-transparent hover:bg-blue-50 hover:border-blue-200"
							}`}
						>
							<p
								className={`text-sm leading-5 m-0 ${
									selectedIndex === index
										? "text-blue-700 font-medium"
										: "text-slate-800"
								}`}
							>
								{item.label}
							</p>
						</div>
					</AnimatedItem>
				))}
			</div>
			{showGradients && (
				<>
					<div
						className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-white to-transparent pointer-events-none rounded-t-lg transition-opacity duration-300"
						style={{ opacity: topGradientOpacity }}
					/>
					<div
						className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-white to-transparent pointer-events-none rounded-b-lg transition-opacity duration-300"
						style={{ opacity: bottomGradientOpacity }}
					/>
				</>
			)}
		</div>
	);
};

export default AnimatedList;
