import { useCallback, useEffect, useRef, useState } from "react";
import { getCampaignProgress } from "../services/campaignService.ts";
import type { ExecutionProgress } from "../types";

const POLL_INTERVAL_MS = 3000;

interface UseCampaignProgressResult {
	progress: ExecutionProgress | null;
	isPolling: boolean;
	error: string | null;
	startPolling: () => void;
	stopPolling: () => void;
}

export function useCampaignProgress(
	campaignId: string | undefined,
	enabled = false,
	onComplete?: () => void,
): UseCampaignProgressResult {
	const [progress, setProgress] = useState<ExecutionProgress | null>(null);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	const stopPolling = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current);
			intervalRef.current = null;
		}
		setIsPolling(false);
	}, []);

	const poll = useCallback(async () => {
		if (!campaignId) return;
		try {
			const data = await getCampaignProgress(campaignId);
			setProgress(data);
			setError(null);

			if (data.is_complete) {
				stopPolling();
				onCompleteRef.current?.();
			}
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "İlerleme alınamadı",
			);
		}
	}, [campaignId, stopPolling]);

	const startPolling = useCallback(() => {
		if (intervalRef.current || !campaignId) return;
		setIsPolling(true);
		poll();
		intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
	}, [campaignId, poll]);

	useEffect(() => {
		if (enabled && campaignId) {
			startPolling();
		}
		return () => stopPolling();
	}, [enabled, campaignId, startPolling, stopPolling]);

	return { progress, isPolling, error, startPolling, stopPolling };
}
