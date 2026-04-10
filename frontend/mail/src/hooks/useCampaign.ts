import { useCallback, useEffect, useState } from "react";
import { getCampaign } from "../services/campaignService.ts";
import type { CampaignResponse } from "../types";

interface UseCampaignResult {
	campaign: CampaignResponse | null;
	isLoading: boolean;
	error: string | null;
	refresh: () => void;
}

export function useCampaign(campaignId: string | undefined): UseCampaignResult {
	const [campaign, setCampaign] = useState<CampaignResponse | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const refresh = useCallback(() => {
		setRefreshKey((k) => k + 1);
	}, []);

	useEffect(() => {
		if (!campaignId) {
			setIsLoading(false);
			setError("Kampanya ID'si bulunamadı");
			return;
		}

		let cancelled = false;
		setIsLoading(true);
		setError(null);

		getCampaign(campaignId)
			.then((data) => {
				if (!cancelled) {
					setCampaign(data);
					setIsLoading(false);
				}
			})
			.catch((err: unknown) => {
				if (!cancelled) {
					setError(err instanceof Error ? err.message : "Kampanya yüklenemedi");
					setIsLoading(false);
				}
			});

		return () => {
			cancelled = true;
		};
	}, [campaignId, refreshKey]);

	return { campaign, isLoading, error, refresh };
}
