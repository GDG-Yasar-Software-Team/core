import { useEffect, useRef, useState } from "react";
import type { FieldType } from "../types";
import AnimatedList, { type AnimatedListItem } from "./AnimatedList";

const FIELD_TYPE_ITEMS: AnimatedListItem[] = [
	{ value: "text", label: "Kısa Metin" },
	{ value: "textarea", label: "Uzun Metin" },
	{ value: "number", label: "Sayı" },
	{ value: "select", label: "Açılır Liste" },
	{ value: "multiselect", label: "Çoklu Seçim" },
	{ value: "checkbox", label: "Onay Kutusu" },
	{ value: "radio", label: "Tekli Seçim (Yuvarlak)" },
	{ value: "date", label: "Tarih" },
	{ value: "department", label: "Bölüm Listesi" },
];

interface FieldTypeSelectProps {
	value: FieldType;
	onChange: (value: FieldType) => void;
	label?: string;
	required?: boolean;
}

const FieldTypeSelect = ({
	value,
	onChange,
	label,
	required,
}: FieldTypeSelectProps) => {
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
		<div ref={containerRef} className="relative mt-2">
			{label && (
				<span
					className={`pointer-events-none absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs font-semibold transition-colors duration-200 z-10 ${
						isOpen ? "text-violet-600" : "text-slate-500"
					}`}
				>
					{label}
					{required && <span className="text-red-500 ml-0.5">*</span>}
				</span>
			)}
			<button
				type="button"
				onClick={() => setIsOpen((prev) => !prev)}
				className={`w-full rounded-2xl border-2 bg-white px-4 pb-3 pt-5 text-left text-sm transition-all duration-200 flex items-center justify-between focus:outline-none ${
					isOpen
						? "border-violet-500 shadow-sm shadow-violet-100"
						: "border-slate-200 hover:border-slate-300"
				}`}
			>
				<span className="text-slate-800">{selectedLabel}</span>
				<svg
					className={`h-4 w-4 flex-shrink-0 transition-transform duration-200 ${
						isOpen ? "rotate-180 text-violet-500" : "text-slate-400"
					}`}
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
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
				<div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200">
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
