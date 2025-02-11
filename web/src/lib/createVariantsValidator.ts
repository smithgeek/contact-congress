export function createVariantsValidator<T extends { [key in TKey]: {} }, TKey extends keyof T>(
	variants: T,
	key: TKey,
	defaultValue?: undefined | null
): (value: unknown) => keyof T[TKey] | undefined;
export function createVariantsValidator<T extends { [key in TKey]: {} }, TKey extends keyof T>(
	variants: T,
	key: TKey,
	defaultValue: keyof T[TKey]
): (value: unknown) => keyof T[TKey];
export function createVariantsValidator<T extends { [key in TKey]: {} }, TKey extends keyof T>(
	variants: T,
	key: TKey,
	defaultValue?: keyof T[TKey] | null
): (value: unknown) => keyof T[TKey] | undefined {
	return (value: unknown) => {
		if (value && typeof value === "string" && value in variants[key]) {
			return value as keyof T[TKey];
		}
		return defaultValue ?? undefined;
	};
}
