import { useCallback, useState } from "react";

const STORAGE_KEY = "admin_authorized";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";

// DEBUG: Remove this after testing
console.log(
	"ADMIN_PASSWORD from env:",
	ADMIN_PASSWORD,
	"length:",
	ADMIN_PASSWORD.length,
);

function getStoredAuth(): boolean {
	if (typeof window === "undefined") {
		return false;
	}
	return sessionStorage.getItem(STORAGE_KEY) === "true";
}

export function useAdminAuth() {
	const [isAuthorized, setIsAuthorized] = useState(getStoredAuth);

	const authorize = useCallback((password: string): boolean => {
		// DEBUG: Remove this after testing
		console.log(
			"Entered:",
			JSON.stringify(password),
			"Expected:",
			JSON.stringify(ADMIN_PASSWORD),
		);
		if (password === ADMIN_PASSWORD) {
			sessionStorage.setItem(STORAGE_KEY, "true");
			setIsAuthorized(true);
			return true;
		}
		return false;
	}, []);

	const logout = useCallback(() => {
		sessionStorage.removeItem(STORAGE_KEY);
		setIsAuthorized(false);
	}, []);

	return { isAuthorized, authorize, logout };
}
