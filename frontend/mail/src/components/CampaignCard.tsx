import { Calendar, Clock, Send } from "lucide-react";
import { Link } from "react-router-dom";
import type { CampaignListItem } from "../types";
import { formatRelative } from "../utils/formatDate.ts";
import StatusBadge from "./StatusBadge";

interface CampaignCardProps {
	campaign: CampaignListItem;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
	return (
		<Link
			to={`/campaigns/${campaign.id}`}
			className="group block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-google-blue/30 hover:shadow-md"
		>
			<div className="flex items-start justify-between gap-3">
				<h3 className="font-display text-base font-semibold text-gray-900 group-hover:text-google-blue">
					{campaign.subject}
				</h3>
				<StatusBadge status={campaign.status} />
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-gray-500">
				<span className="inline-flex items-center gap-1">
					<Clock className="h-3.5 w-3.5" />
					{campaign.scheduled_sends_count} zamanlanmış gönderim
				</span>
				<span className="inline-flex items-center gap-1">
					<Send className="h-3.5 w-3.5" />
					{campaign.executions_count} çalıştırma
				</span>
				<span className="inline-flex items-center gap-1">
					<Calendar className="h-3.5 w-3.5" />
					{formatRelative(campaign.created_at)}
				</span>
			</div>
		</Link>
	);
}
