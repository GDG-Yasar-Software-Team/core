import { AlertTriangle } from "lucide-react";
import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	description: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "primary";
	loading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export default function ConfirmDialog({
	open,
	title,
	description,
	confirmLabel = "Onayla",
	cancelLabel = "İptal",
	variant = "primary",
	loading = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	const dialogRef = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	const confirmClasses =
		variant === "danger"
			? "bg-google-red hover:bg-red-600 text-white"
			: "bg-google-blue hover:bg-blue-600 text-white";

	return (
		<dialog
			ref={dialogRef}
			onClose={onCancel}
			className="w-full max-w-md rounded-2xl border-0 bg-white p-0 shadow-xl backdrop:bg-black/40"
		>
			<div className="p-6">
				<div className="flex items-start gap-4">
					<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-yellow-100">
						<AlertTriangle className="h-5 w-5 text-yellow-600" />
					</div>
					<div>
						<h3 className="font-display text-lg font-semibold text-gray-900">
							{title}
						</h3>
						<p className="mt-1 text-sm text-gray-500">{description}</p>
					</div>
				</div>
				<div className="mt-6 flex justify-end gap-3">
					<button
						type="button"
						onClick={onCancel}
						disabled={loading}
						className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
					>
						{cancelLabel}
					</button>
					<button
						type="button"
						onClick={onConfirm}
						disabled={loading}
						className={`rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${confirmClasses}`}
					>
						{loading ? "İşleniyor..." : confirmLabel}
					</button>
				</div>
			</div>
		</dialog>
	);
}
