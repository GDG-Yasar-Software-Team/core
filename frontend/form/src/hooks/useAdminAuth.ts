import { useCallback, useState } from "react";

const TOKEN_KEY = "admin_api_token";

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
	const [isAuthorized, setIsAuthorized] = useState(
		() => sessionStorage.getItem(TOKEN_KEY) !== null,
	);

	const authorize = useCallback((token: string): boolean => {
		if (token && token.trim().length > 0) {
			sessionStorage.setItem(TOKEN_KEY, token.trim());
			setIsAuthorized(true);
			return true;
		}
		return false;
	}, []);

	const logout = useCallback(() => {
		sessionStorage.removeItem(TOKEN_KEY);
		setIsAuthorized(false);
	}, []);

	return { isAuthorized, authorize, logout };
}
