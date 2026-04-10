import { useCallback, useEffect, useState } from "react";
import { listCampaigns } from "../services/campaignService.ts";
import type { CampaignListItem } from "../types";

interface UseCampaignsResult {
	campaigns: CampaignListItem[];
	isLoading: boolean;
	error: string | null;
	page: number;
	setPage: (page: number) => void;
	pageSize: number;
	hasMore: boolean;
	refresh: () => void;
}

export function useCampaigns(pageSize = 20): UseCampaignsResult {
	const [campaigns, setCampaigns] = useState<CampaignListItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(0);
	const [hasMore, setHasMore] = useState(true);
	const [refreshKey, setRefreshKey] = useState(0);

	const refresh = useCallback(() => {
		setRefreshKey((k) => k + 1);
	}, []);

	useEffect(() => {
		let cancelled = false;
		setIsLoading(true);
		setError(null);

		listCampaigns(pageSize, page * pageSize)
			.then((data) => {
				if (!cancelled) {
					setCampaigns(data);
					setHasMore(data.length === pageSize);
					setIsLoading(false);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(
						err instanceof Error ? err.message : "Kampanyalar yüklenemedi",
					);
					setIsLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [page, pageSize, refreshKey]);

	return {
		campaigns,
		isLoading,
		error,
		page,
		setPage,
		pageSize,
		hasMore,
		refresh,
	};
}
