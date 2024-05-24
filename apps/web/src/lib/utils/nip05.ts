// regexp that accepts an email address or just a domain (without @)
const emailOrDomain = /^(?:[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}|[a-z0-9.-]+\.[a-z]{2,})$/i;

export function looksLikeNip05(value: string) {
    return emailOrDomain.test(value);
}