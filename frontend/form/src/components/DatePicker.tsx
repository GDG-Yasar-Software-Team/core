import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
	label: string;
	value: string;
	onChange: (value: string) => void;
}

const MONTHS = [
	"Ocak",
	"Şubat",
	"Mart",
	"Nisan",
	"Mayıs",
	"Haziran",
	"Temmuz",
	"Ağustos",
	"Eylül",
	"Ekim",
	"Kasım",
	"Aralık",
];

const DAY_LABELS = ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"];

function getDaysInMonth(year: number, month: number): number {
	return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
	const day = new Date(year, month, 1).getDay();
	return day === 0 ? 6 : day - 1;
}

function parseDate(value: string): Date | null {
	if (!value) return null;
	const d = new Date(`${value}T00:00:00`);
	return Number.isNaN(d.getTime()) ? null : d;
}

function toISODate(year: number, month: number, day: number): string {
	return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function DatePicker({ label, value, onChange }: DatePickerProps) {
	const [open, setOpen] = useState(false);
	const today = new Date();
	const selected = parseDate(value);

	const [viewYear, setViewYear] = useState(
		selected?.getFullYear() ?? today.getFullYear(),
	);
	const [viewMonth, setViewMonth] = useState(
		selected?.getMonth() ?? today.getMonth(),
	);

	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (
				containerRef.current &&
				!containerRef.current.contains(e.target as Node)
			) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	function prevMonth() {
		if (viewMonth === 0) {
			setViewMonth(11);
			setViewYear((y) => y - 1);
		} else {
			setViewMonth((m) => m - 1);
		}
	}

	function nextMonth() {
		if (viewMonth === 11) {
			setViewMonth(0);
			setViewYear((y) => y + 1);
		} else {
			setViewMonth((m) => m + 1);
		}
	}

	function selectDay(day: number) {
		onChange(toISODate(viewYear, viewMonth, day));
		setOpen(false);
	}

	function selectToday() {
		const t = new Date();
		setViewYear(t.getFullYear());
		setViewMonth(t.getMonth());
		onChange(toISODate(t.getFullYear(), t.getMonth(), t.getDate()));
		setOpen(false);
	}

	const displayValue = selected
		? `${String(selected.getDate()).padStart(2, "0")}/${String(selected.getMonth() + 1).padStart(2, "0")}/${selected.getFullYear()}`
		: "";

	const daysInMonth = getDaysInMonth(viewYear, viewMonth);
	const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

	return (
		<div ref={containerRef} className="relative">
			{/* Input field */}
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				className={`group relative w-full rounded-2xl border-2 px-4 pb-3 pt-5 text-left transition-all duration-200 ${
					open
						? "border-violet-500 shadow-sm shadow-violet-100"
						: "border-slate-200 hover:border-slate-300"
				}`}
			>
				<span
					className={`pointer-events-none absolute left-4 top-0 -translate-y-1/2 bg-white px-1 text-xs font-semibold transition-colors duration-200 ${
						open ? "text-violet-600" : "text-slate-500"
					}`}
				>
					{label}
				</span>

				<div className="flex items-center justify-between">
					<span
						className={`text-sm ${displayValue ? "text-slate-800" : "text-slate-400"}`}
					>
						{displayValue || "gg/aa/yyyy"}
					</span>

					<svg
						xmlns="http://www.w3.org/2000/svg"
						className={`h-4 w-4 flex-shrink-0 transition-colors duration-200 ${
							open ? "text-violet-500" : "text-slate-400"
						}`}
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fillRule="evenodd"
							d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
							clipRule="evenodd"
						/>
					</svg>
				</div>
			</button>

			{/* Calendar dropdown */}
			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: -6, scale: 0.97 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -6, scale: 0.97 }}
						transition={{ duration: 0.15, ease: "easeOut" }}
						className="absolute left-0 top-full z-50 mt-2 w-72 rounded-2xl border border-slate-100 bg-white p-4 shadow-xl shadow-slate-200"
					>
						{/* Month/Year navigation */}
						<div className="mb-3 flex items-center justify-between">
							<button
								type="button"
								onClick={prevMonth}
								className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-label="Önceki ay"
								>
									<path
										fillRule="evenodd"
										d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</button>

							<span className="text-sm font-semibold text-slate-700">
								{MONTHS[viewMonth]} {viewYear}
							</span>

							<button
								type="button"
								onClick={nextMonth}
								className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-4 w-4"
									viewBox="0 0 20 20"
									fill="currentColor"
									aria-label="Sonraki ay"
								>
									<path
										fillRule="evenodd"
										d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
										clipRule="evenodd"
									/>
								</svg>
							</button>
						</div>

						{/* Day labels */}
						<div className="mb-1 grid grid-cols-7">
							{DAY_LABELS.map((d) => (
								<div
									key={d}
									className="py-1 text-center text-xs font-medium text-slate-400"
								>
									{d}
								</div>
							))}
						</div>

						{/* Days grid */}
						<div className="grid grid-cols-7 gap-y-0.5">
							{Array.from({ length: firstDay }, (_, i) => (
								<div key={`empty-${i}`} />
							))}

							{Array.from({ length: daysInMonth }, (_, i) => {
								const day = i + 1;
								const isSelected =
									selected &&
									selected.getDate() === day &&
									selected.getMonth() === viewMonth &&
									selected.getFullYear() === viewYear;
								const isToday =
									today.getDate() === day &&
									today.getMonth() === viewMonth &&
									today.getFullYear() === viewYear;

								return (
									<button
										key={day}
										type="button"
										onClick={() => selectDay(day)}
										className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition-colors ${
											isSelected
												? "bg-violet-600 font-semibold text-white shadow-sm"
												: isToday
													? "bg-violet-100 font-medium text-violet-700"
													: "text-slate-700 hover:bg-slate-100"
										}`}
									>
										{day}
									</button>
								);
							})}
						</div>

						{/* Footer */}
						<div className="mt-3 flex justify-between border-t border-slate-100 pt-2">
							<button
								type="button"
								onClick={() => {
									onChange("");
									setOpen(false);
								}}
								className="text-xs text-slate-400 transition-colors hover:text-slate-600"
							>
								Temizle
							</button>
							<button
								type="button"
								onClick={selectToday}
								className="text-xs font-medium text-violet-600 transition-colors hover:text-violet-700"
							>
								Bugün
							</button>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
