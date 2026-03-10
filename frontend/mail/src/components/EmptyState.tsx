import { Inbox } from "lucide-react";

interface EmptyStateProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
}

export default function EmptyState({
	title,
	description,
	action,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<Inbox className="mb-4 h-16 w-16 text-gray-300" strokeWidth={1} />
			<h3 className="font-display text-lg font-semibold text-gray-700">
				{title}
			</h3>
			{description && (
				<p className="mt-1 max-w-sm text-sm text-gray-500">{description}</p>
			)}
			{action && <div className="mt-4">{action}</div>}
		</div>
	);
}
