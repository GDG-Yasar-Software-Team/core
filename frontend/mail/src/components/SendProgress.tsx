import {
	AlertTriangle,
	CheckCircle,
	Loader2,
	Mail,
	XCircle,
} from "lucide-react";
import { useMemo } from "react";
import type { ExecutionProgress } from "../types";

interface SendProgressProps {
	progress: ExecutionProgress;
	isPolling?: boolean;
}

export default function SendProgress({
	progress,
	isPolling = true,
}: SendProgressProps) {
	const {
		total_recipients,
		sent_count,
		failed_count,
		started_at,
		is_complete,
	} = progress;

	const processed = sent_count + failed_count;
	const percentage =
		total_recipients > 0 ? Math.round((processed / total_recipients) * 100) : 0;

	const estimatedRemaining = useMemo(() => {
		if (is_complete || processed === 0 || total_recipients === 0) return null;
		const elapsed = Date.now() - new Date(started_at).getTime();
		const avgPerItem = elapsed / processed;
		const remaining = (total_recipients - processed) * avgPerItem;
		const minutes = Math.ceil(remaining / 60000);
		if (minutes < 1) return "1 dakikadan az";
		return `~${minutes} dakika`;
	}, [is_complete, processed, total_recipients, started_at]);

	const hasFailures = failed_count > 0;

	return (
		<div className="rounded-xl border border-gray-200 bg-white p-6">
			<div className="mb-4 flex items-center gap-3">
				{is_complete ? (
					hasFailures ? (
						<AlertTriangle className="h-6 w-6 text-amber-500" />
					) : (
						<CheckCircle className="h-6 w-6 text-green-500" />
					)
				) : (
					<Loader2 className="h-6 w-6 animate-spin text-google-blue" />
				)}
				<h2 className="font-display text-lg font-semibold text-gray-900">
					{is_complete ? "Gönderim Tamamlandı" : "Gönderim Devam Ediyor"}
				</h2>
			</div>

			<div className="mb-2 flex items-center justify-between text-sm text-gray-600">
				<span>
					{processed} / {total_recipients} işlendi
				</span>
				<span className="font-medium">{percentage}%</span>
			</div>

			<div className="mb-4 h-3 overflow-hidden rounded-full bg-gray-100">
				<div
					className={`h-full rounded-full transition-all duration-500 ease-out ${
						is_complete
							? hasFailures
								? "bg-amber-400"
								: "bg-green-500"
							: "bg-google-blue"
					}`}
					style={{ width: `${percentage}%` }}
				/>
			</div>

			<div className="grid grid-cols-3 gap-4">
				<div className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-center">
					<div className="flex items-center justify-center gap-1.5 text-gray-500">
						<Mail className="h-4 w-4" />
						<span className="text-xs">Toplam</span>
					</div>
					<p className="mt-1 font-display text-xl font-bold text-gray-900">
						{total_recipients}
					</p>
				</div>
				<div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-center">
					<div className="flex items-center justify-center gap-1.5 text-green-600">
						<CheckCircle className="h-4 w-4" />
						<span className="text-xs">Başarılı</span>
					</div>
					<p className="mt-1 font-display text-xl font-bold text-green-700">
						{sent_count}
					</p>
				</div>
				<div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-center">
					<div className="flex items-center justify-center gap-1.5 text-red-500">
						<XCircle className="h-4 w-4" />
						<span className="text-xs">Başarısız</span>
					</div>
					<p className="mt-1 font-display text-xl font-bold text-red-600">
						{failed_count}
					</p>
				</div>
			</div>

			{!is_complete && estimatedRemaining && (
				<p className="mt-4 text-center text-sm text-gray-500">
					Tahmini kalan süre: {estimatedRemaining}
					{!isPolling ? " (yeniden bağlanıyor...)" : ""}
				</p>
			)}

			{is_complete && (
				<div
					className={`mt-4 rounded-lg px-4 py-3 text-center text-sm font-medium ${
						hasFailures
							? "bg-amber-50 text-amber-700"
							: "bg-green-50 text-green-700"
					}`}
				>
					{hasFailures
						? `Gönderim tamamlandı. ${sent_count} başarılı, ${failed_count} başarısız.`
						: `Tüm e-postalar başarıyla gönderildi!`}
				</div>
			)}
		</div>
	);
}
