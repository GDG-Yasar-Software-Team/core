import { Plus, Trash2 } from "lucide-react";
import type { ScheduledSend } from "../types";
import {
	fromLocalDatetimeValue,
	toLocalDatetimeValue,
} from "../utils/formatDate.ts";

interface ScheduleFormProps {
	schedules: ScheduledSend[];
	useCustomSubjects: boolean;
	onSchedulesChange: (schedules: ScheduledSend[]) => void;
	onCustomSubjectsChange: (value: boolean) => void;
}

export default function ScheduleForm({
	schedules,
	useCustomSubjects,
	onSchedulesChange,
	onCustomSubjectsChange,
}: ScheduleFormProps) {
	const addSchedule = () => {
		onSchedulesChange([
			...schedules,
			{ time: new Date().toISOString(), subject: null },
		]);
	};

	const removeSchedule = (index: number) => {
		onSchedulesChange(schedules.filter((_, i) => i !== index));
	};

	const updateSchedule = (index: number, patch: Partial<ScheduledSend>) => {
		onSchedulesChange(
			schedules.map((s, i) => (i === index ? { ...s, ...patch } : s)),
		);
	};

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<label className="flex items-center gap-2 text-sm text-gray-700">
					<input
						type="checkbox"
						checked={useCustomSubjects}
						onChange={(e) => onCustomSubjectsChange(e.target.checked)}
						className="h-4 w-4 rounded border-gray-300 text-google-blue focus:ring-google-blue"
					/>
					Gönderim başına özel konu kullan
				</label>
			</div>

			<div className="space-y-3">
				{schedules.map((schedule, index) => {
					const timeId = `schedule-time-${index}`;
					const subjectId = `schedule-subject-${index}`;
					return (
						<div
							key={schedule.time}
							className="flex flex-wrap items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
						>
							<div className="flex-1 min-w-[200px]">
								<label
									htmlFor={timeId}
									className="mb-1 block text-xs font-medium text-gray-500"
								>
									Tarih & Saat
								</label>
								<input
									id={timeId}
									type="datetime-local"
									value={toLocalDatetimeValue(schedule.time)}
									onChange={(e) =>
										updateSchedule(index, {
											time: fromLocalDatetimeValue(e.target.value),
										})
									}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-google-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
								/>
							</div>

							{useCustomSubjects && (
								<div className="flex-1 min-w-[200px]">
									<label
										htmlFor={subjectId}
										className="mb-1 block text-xs font-medium text-gray-500"
									>
										Özel Konu
									</label>
									<input
										id={subjectId}
										type="text"
										value={schedule.subject ?? ""}
										onChange={(e) =>
											updateSchedule(index, {
												subject: e.target.value || null,
											})
										}
										placeholder="Varsayılan konu kullanılacak"
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-google-blue focus:outline-none focus:ring-2 focus:ring-blue-100"
									/>
								</div>
							)}

							<button
								type="button"
								onClick={() => removeSchedule(index)}
								className="mt-5 rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-google-red"
								aria-label="Zamanlamayı sil"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					);
				})}
			</div>

			<button
				type="button"
				onClick={addSchedule}
				className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-google-blue hover:text-google-blue"
			>
				<Plus className="h-4 w-4" />
				Zamanlama Ekle
			</button>
		</div>
	);
}
