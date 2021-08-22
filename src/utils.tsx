export function assertIsDefined<T>(val: T, msg?: string): asserts val is NonNullable<T> {
	console.assert(val !== undefined && val !== null, msg);
}

