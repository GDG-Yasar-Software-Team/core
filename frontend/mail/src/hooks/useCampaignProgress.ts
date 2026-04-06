import { useCallback, useEffect, useRef, useState } from "react";
import { getCampaignProgress } from "../services/campaignService.ts";
import type { ExecutionProgress } from "../types";

const POLL_INTERVAL_MS = 2000;
const ERROR_BACKOFF_MS = 5000;

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
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isPollingRef = useRef(false);
	const onCompleteRef = useRef(onComplete);
	onCompleteRef.current = onComplete;

	const stopPolling = useCallback(() => {
		isPollingRef.current = false;
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsPolling(false);
	}, []);

	const poll = useCallback(async (): Promise<void> => {
		if (!campaignId) return;
		try {
			const data = await getCampaignProgress(campaignId);
			setProgress(data);
			setError(null);

			if (data.is_complete) {
				stopPolling();
				onCompleteRef.current?.();
				return;
			}

			if (isPollingRef.current) {
				timeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
			}
		} catch (err: unknown) {
			setError(
				err instanceof Error ? err.message : "İlerleme alınamadı",
			);
			if (isPollingRef.current) {
				timeoutRef.current = setTimeout(poll, ERROR_BACKOFF_MS);
			}
		}
	}, [campaignId, stopPolling]);

	const startPolling = useCallback(() => {
		if (isPollingRef.current || !campaignId) return;
		isPollingRef.current = true;
		setIsPolling(true);
		void poll();
	}, [campaignId, poll]);

	useEffect(() => {
		if (enabled && campaignId) {
			startPolling();
		}
		return () => stopPolling();
	}, [enabled, campaignId, startPolling, stopPolling]);

	return { progress, isPolling, error, startPolling, stopPolling };
}
