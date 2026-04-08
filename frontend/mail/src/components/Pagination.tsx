import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
	page: number;
	hasMore: boolean;
	onPageChange: (page: number) => void;
}

export default function Pagination({
	page,
	hasMore,
	onPageChange,
}: PaginationProps) {
	return (
		<div className="flex items-center justify-center gap-3 pt-4">
			<button
				type="button"
				disabled={page === 0}
				onClick={() => onPageChange(page - 1)}
				className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
			>
				<ChevronLeft className="h-4 w-4" />
				Önceki
			</button>
			<span className="text-sm text-gray-500">Sayfa {page + 1}</span>
			<button
				type="button"
				disabled={!hasMore}
				onClick={() => onPageChange(page + 1)}
				className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
			>
				Sonraki
				<ChevronRight className="h-4 w-4" />
			</button>
		</div>
	);
}
