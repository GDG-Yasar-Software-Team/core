import { useCallback, useState } from "react";

const AUTH_KEY = "admin_authorized";
const TOKEN_KEY = "admin_api_token";

function getStoredAuth(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return sessionStorage.getItem(AUTH_KEY) === "true";
}

/**
 * Get the stored admin API token.
 * This is exported for use by API services.
 */
export function getAdminToken(): string | null {
	if (typeof window === "undefined") {
		return null;
	}
	return sessionStorage.getItem(TOKEN_KEY);
}

export function useAdminAuth() {
	const [isAuthorized, setIsAuthorized] = useState(getStoredAuth);

	const authorize = useCallback((token: string): boolean => {
		if (token && token.trim().length > 0) {
			sessionStorage.setItem(TOKEN_KEY, token.trim());
			sessionStorage.setItem(AUTH_KEY, "true");
			setIsAuthorized(true);
			return true;
		}
		return false;
	}, []);

	const logout = useCallback(() => {
		sessionStorage.removeItem(AUTH_KEY);
		sessionStorage.removeItem(TOKEN_KEY);
		setIsAuthorized(false);
	}, []);

	return { isAuthorized, authorize, logout };
}
