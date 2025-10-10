// regexp that accepts an email address or just a domain (without @)
const emailOrDomain = /^(?:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|[a-z0-9.-]+\.[a-z]{2,})$/i;

export function looksLikeNip05(value: string) {
    return emailOrDomain.test(value);
}

export function prettifyNip05(nip05: string, maxLength?: number | undefined): string {
	const trimmedNip05: string = nip05.startsWith("_@") ? nip05.substring(2) : nip05;
	if (maxLength) {
		return trimmedNip05.slice(0, maxLength);
	}
	return trimmedNip05;
}