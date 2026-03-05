import { useState, useRef, useEffect } from "react";
import type { FieldType } from "../types";
import AnimatedList, { type AnimatedListItem } from "./AnimatedList";

const FIELD_TYPE_ITEMS: AnimatedListItem[] = [
	{ value: "text", label: "Kısa Metin" },
	{ value: "textarea", label: "Uzun Metin" },
	{ value: "number", label: "Sayı" },
	{ value: "select", label: "Açılır Liste" },
	{ value: "multiselect", label: "Çoklu Seçim" },
	{ value: "checkbox", label: "Onay Kutusu" },
	{ value: "radio", label: "Radyo Butonları" },
	{ value: "date", label: "Tarih" },
];

interface FieldTypeSelectProps {
	value: FieldType;
	onChange: (value: FieldType) => void;
}

const FieldTypeSelect = ({ value, onChange }: FieldTypeSelectProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const selectedLabel =
		FIELD_TYPE_ITEMS.find((item) => item.value === value)?.label ?? value;

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setIsOpen(false);
			}
		};
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen]);

	const handleSelect = (item: AnimatedListItem) => {
		onChange(item.value as FieldType);
		setIsOpen(false);
	};

	return (
		<div ref={containerRef} className="relative mt-1">
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 flex items-center justify-between"
			>
				<span className="text-slate-800">{selectedLabel}</span>
				<svg
					className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{isOpen && (
				<div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
					<AnimatedList
						items={FIELD_TYPE_ITEMS}
						selectedValue={value}
						onItemSelect={handleSelect}
					/>
				</div>
			)}
		</div>
	);
};

export default FieldTypeSelect;
