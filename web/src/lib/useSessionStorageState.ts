import { useEffect, useState } from "react";

export function useSessionStorageState<T>(key: string, initialValue: T) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		try {
			const item = window.sessionStorage.getItem(key);
			return item ? JSON.parse(item) : initialValue;
		} catch (error) {
			console.error(error);
			return initialValue;
		}
	});

	useEffect(() => {
		try {
			if (storedValue === initialValue) {
				window.sessionStorage.removeItem(key);
			} else {
				window.sessionStorage.setItem(key, JSON.stringify(storedValue));
			}
		} catch (error) {
			console.error(error);
		}
	}, [key, storedValue]);

	return [storedValue, setStoredValue] as const;
}
