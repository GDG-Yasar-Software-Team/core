import { useCallback, useState } from "react";
import { triggerCampaign } from "../services/campaignService.ts";
import type { TriggerResult } from "../types";

interface UseTriggerResult {
	trigger: (campaignId: string) => Promise<TriggerResult>;
	isTriggering: boolean;
	error: string | null;
}

export function useTrigger(): UseTriggerResult {
	const [isTriggering, setIsTriggering] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const trigger = useCallback(async (campaignId: string) => {
		setIsTriggering(true);
		setError(null);
		try {
			const result = await triggerCampaign(campaignId);
			return result;
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Kampanya tetiklenemedi";
			setError(message);
			throw err;
		} finally {
			setIsTriggering(false);
		}
	}, []);

	return { trigger, isTriggering, error };
}
