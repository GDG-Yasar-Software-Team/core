import { useCallback, useEffect, useRef, useState } from "react";
import { getCampaignProgress } from "../services/campaignService.ts";
import type { ExecutionProgress } from "../types";

const POLL_INTERVAL_MS = 2000;
const ERROR_BACKOFF_MS = 5000;
const MAX_CONSECUTIVE_FAILURES = 8;

interface UseCampaignProgressResult {
	progress: ExecutionProgress | null;
	isPolling: boolean;
	error: string | null;
	pollingGivenUp: boolean;
	startPolling: () => void;
	stopPolling: () => void;
	/** Resume after max failures (e.g. user clicked refresh). */
	retryPolling: () => void;
}

export function useCampaignProgress(
	campaignId: string | undefined,
	enabled = false,
	onComplete?: () => void,
	onGiveUp?: () => void,
): UseCampaignProgressResult {
	const [progress, setProgress] = useState<ExecutionProgress | null>(null);
	const [isPolling, setIsPolling] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pollingGivenUp, setPollingGivenUp] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isPollingRef = useRef(false);
	const consecutiveFailuresRef = useRef(0);
	const onCompleteRef = useRef(onComplete);
	const onGiveUpRef = useRef(onGiveUp);
	onCompleteRef.current = onComplete;
	onGiveUpRef.current = onGiveUp;

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
			consecutiveFailuresRef.current = 0;

			if (data.is_complete) {
				stopPolling();
				onCompleteRef.current?.();
				return;
			}

			if (isPollingRef.current) {
				timeoutRef.current = setTimeout(poll, POLL_INTERVAL_MS);
			}
		} catch (err: unknown) {
			consecutiveFailuresRef.current += 1;
			setError(err instanceof Error ? err.message : "İlerleme alınamadı");

			if (consecutiveFailuresRef.current >= MAX_CONSECUTIVE_FAILURES) {
				stopPolling();
				setPollingGivenUp(true);
				onGiveUpRef.current?.();
				return;
			}

			if (isPollingRef.current) {
				timeoutRef.current = setTimeout(poll, ERROR_BACKOFF_MS);
			}
		}
	}, [campaignId, stopPolling]);

	const startPolling = useCallback(() => {
		if (isPollingRef.current || !campaignId) return;
		isPollingRef.current = true;
		setIsPolling(true);
		setPollingGivenUp(false);
		consecutiveFailuresRef.current = 0;
		void poll();
	}, [campaignId, poll]);

	const retryPolling = useCallback(() => {
		if (!campaignId || !enabled) return;
		setPollingGivenUp(false);
		setError(null);
		consecutiveFailuresRef.current = 0;
		if (isPollingRef.current) return;
		isPollingRef.current = true;
		setIsPolling(true);
		void poll();
	}, [campaignId, enabled, poll]);

	useEffect(() => {
		if (enabled && campaignId) {
			startPolling();
		}
		return () => stopPolling();
	}, [enabled, campaignId, startPolling, stopPolling]);

	return {
		progress,
		isPolling,
		error,
		pollingGivenUp,
		startPolling,
		stopPolling,
		retryPolling,
	};
}
