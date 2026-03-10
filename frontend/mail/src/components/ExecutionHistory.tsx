import { ChevronDown, ChevronUp, Zap } from "lucide-react";
import { useState } from "react";
import type { ExecutionRecord } from "../types";
import { formatDateTime } from "../utils/formatDate.ts";

interface ExecutionHistoryProps {
	executions: ExecutionRecord[];
}

function ExecutionRow({ execution }: { execution: ExecutionRecord }) {
	const [expanded, setExpanded] = useState(false);
	const total = execution.sent_count + execution.failed_count;
	const successRate =
		total > 0 ? Math.round((execution.sent_count / total) * 100) : 0;

	return (
		<div className="border-b border-gray-100 last:border-0">
			<button
				type="button"
				onClick={() => setExpanded(!expanded)}
				className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm hover:bg-gray-50"
			>
				<div className="flex-1">
					<div className="flex items-center gap-2">
						<span className="font-medium text-gray-900">
							{execution.subject_used}
						</span>
						{execution.is_manual_trigger && (
							<span className="inline-flex items-center gap-0.5 rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-700">
								<Zap className="h-3 w-3" />
								Manuel
							</span>
						)}
					</div>
					<p className="mt-0.5 text-xs text-gray-500">
						{formatDateTime(execution.started_at)}
						{execution.completed_at &&
							` — ${formatDateTime(execution.completed_at)}`}
					</p>
				</div>
				<div className="flex items-center gap-3">
					<div className="text-right text-xs">
						<span className="font-medium text-google-green">
							{execution.sent_count}
						</span>
						<span className="text-gray-400"> / </span>
						<span className="font-medium text-google-red">
							{execution.failed_count}
						</span>
						<span className="ml-1 text-gray-400">({successRate}%)</span>
					</div>
					{expanded ? (
						<ChevronUp className="h-4 w-4 text-gray-400" />
					) : (
						<ChevronDown className="h-4 w-4 text-gray-400" />
					)}
				</div>
			</button>

			{expanded && (
				<div className="border-t border-gray-100 bg-gray-50 px-4 py-3">
					{execution.recipient_emails.length > 0 && (
						<div className="mb-3">
							<p className="mb-1 text-xs font-medium text-gray-600">
								Başarılı ({execution.sent_count})
							</p>
							<div className="flex flex-wrap gap-1">
								{execution.recipient_emails.map((email) => (
									<span
										key={email}
										className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800"
									>
										{email}
									</span>
								))}
							</div>
						</div>
					)}
					{execution.failed_emails.length > 0 && (
						<div>
							<p className="mb-1 text-xs font-medium text-gray-600">
								Başarısız ({execution.failed_count})
							</p>
							<div className="flex flex-wrap gap-1">
								{execution.failed_emails.map((email) => (
									<span
										key={email}
										className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800"
									>
										{email}
									</span>
								))}
							</div>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function ExecutionHistory({
	executions,
}: ExecutionHistoryProps) {
	if (executions.length === 0) {
		return (
			<p className="py-6 text-center text-sm text-gray-400">
				Henüz bir çalıştırma kaydı yok.
			</p>
		);
	}

	return (
		<div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
			{executions.map((exec) => (
				<ExecutionRow key={exec.started_at} execution={exec} />
			))}
		</div>
	);
}
