import type { CampaignStatus } from "../types";

interface StatusBadgeProps {
	status: CampaignStatus;
}

const config: Record<CampaignStatus, { label: string; classes: string }> = {
	scheduled: {
		label: "Zamanlanmış",
		classes: "bg-blue-100 text-google-blue",
	},
	in_progress: {
		label: "Gönderiliyor",
		classes: "bg-yellow-100 text-yellow-700",
	},
	completed: {
		label: "Tamamlandı",
		classes: "bg-green-100 text-google-green",
	},
	partially_completed: {
		label: "Kısmen Tamamlandı",
		classes: "bg-orange-100 text-orange-700",
	},
	failed: {
		label: "Başarısız",
		classes: "bg-red-100 text-google-red",
	},
};

export default function StatusBadge({ status }: StatusBadgeProps) {
	const { label, classes } = config[status];
	return (
		<span
			className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}
		>
			{label}
		</span>
	);
}
