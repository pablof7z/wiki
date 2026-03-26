const SECONDS_PER_DAY = 24 * 60 * 60;

export const ACTIVE_AUTHOR_HALF_LIFE_DAYS = 30;
export const ACTIVE_AUTHOR_MAX_AGE_DAYS = 365;

type ActivityOptions = {
	now?: number;
	halfLifeDays?: number;
	maxAgeDays?: number;
};

export function calculateRecencyWeight(
	timestamp: number,
	{
		now = Math.floor(Date.now() / 1000),
		halfLifeDays = ACTIVE_AUTHOR_HALF_LIFE_DAYS
	}: ActivityOptions = {}
): number {
	if (!timestamp) return 0;

	const ageInSeconds = Math.max(0, now - timestamp);
	const halfLifeInSeconds = halfLifeDays * SECONDS_PER_DAY;

	if (halfLifeInSeconds <= 0) return 0;

	return Math.pow(0.5, ageInSeconds / halfLifeInSeconds);
}

export function isRecentlyActive(
	timestamp: number,
	{
		now = Math.floor(Date.now() / 1000),
		maxAgeDays = ACTIVE_AUTHOR_MAX_AGE_DAYS
	}: ActivityOptions = {}
): boolean {
	if (!timestamp) return false;

	return now - timestamp <= maxAgeDays * SECONDS_PER_DAY;
}

export function calculateAuthorActivityScore(
	timestamps: number[],
	options: ActivityOptions = {}
): number {
	return timestamps
		.filter((timestamp) => isRecentlyActive(timestamp, options))
		.reduce((score, timestamp) => score + calculateRecencyWeight(timestamp, options), 0);
}
