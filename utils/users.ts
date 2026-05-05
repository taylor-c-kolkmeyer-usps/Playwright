// Maps IBPS logical user names to the exact values expected by token endpoints.
// Source: Selenium UserNameEnum(user.getUser()).
export const IBPS_TOKEN_USERS = {
	IBPS_SELENIUM_01: 'AUTOTEST01', // Automation User (National Admin)

	IBPS0000: 'IBPS0000', // National Admin Role 01
	IBPS0001: 'IBPS0001', // National User Role 02
	IBPS0002: 'IBPS0002', // Area Admin 01 Role 03
	IBPS0003: 'IBPS0003', // Area Admin 02 Role 03
	IBPS0004: 'IBPS0004', // Area User 01 Role 04
	IBPS0005: 'IBPS0005', // Area User 02 Role 04
	IBPS0006: 'IBPS0006', // District User 01 Role 05
	IBPS0007: 'IBPS0007', // District User 02 Role 05
	IBPS0008: 'IBPS0008', // Read-Only Role 06
	IBPS0009: 'IBPS0009', // Non-IBPS User

	IBPS0010: 'IBPS0010', // National Admin
	IBPS0011: 'IBPS0011', // National User
	IBPS0012: 'IBPS0012', // Area Admin 01
	IBPS0013: 'IBPS0013', // Area Admin 02
	IBPS0014: 'IBPS0014', // Area User 01
	IBPS0015: 'IBPS0015', // Area User 02
	IBPS0016: 'IBPS0016', // District User 01
	IBPS0017: 'IBPS0017', // District User 02
	IBPS0018: 'IBPS0018', // Read-Only
	IBPS0019: 'IBPS0019', // Non-IBPS User

	IBPS0020: 'IBPS0020', // Corporate Admin Role 09
	IBPS0021: 'IBPS0021', // Corporate Capital User Role 10
	IBPS0028: 'IBPS0028', // Corporate Read Only Role 11

	IBPS0030: 'IBPS0030', // Corporate Admin
	IBPS0031: 'IBPS0031', // Corporate Capital User
	IBPS0038: 'IBPS0038', // Corporate Read Only
} as const;

export type IbpsTokenUserKey = keyof typeof IBPS_TOKEN_USERS;
export type IbpsTokenUserValue = (typeof IBPS_TOKEN_USERS)[IbpsTokenUserKey];

export function resolveIbpsTokenUser(user: string): string {
	const trimmed = user.trim();
	const withoutInlineComment = trimmed.split('//')[0]?.trim() ?? '';
	const unescapedQuotes = withoutInlineComment.replaceAll(String.raw`\"`, '"').replaceAll(String.raw`\'`, "'");
	const stripOuterQuotes = (value: string): string => {
		if (!value) {
			return value;
		}

		const startsAndEndsWithDoubleQuote = value.startsWith('"') && value.endsWith('"');
		const startsAndEndsWithSingleQuote = value.startsWith("'") && value.endsWith("'");
		return startsAndEndsWithDoubleQuote || startsAndEndsWithSingleQuote ? value.slice(1, -1).trim() : value;
	};
	const unquoted = stripOuterQuotes(stripOuterQuotes(unescapedQuotes.trim()));
	const cleaned =
		unquoted.endsWith(',') || unquoted.endsWith(';')
			? unquoted.slice(0, -1).trim()
			: unquoted;
	const candidate = (cleaned.includes('.') ? cleaned.split('.').at(-1) ?? cleaned : cleaned).trim();
	const upperCandidate = candidate.toUpperCase();

	const fromKey = IBPS_TOKEN_USERS[upperCandidate as IbpsTokenUserKey];
	if (fromKey) {
		return fromKey;
	}

	const values = Object.values(IBPS_TOKEN_USERS) as IbpsTokenUserValue[];
	const fromValue = values.find((value) => value.toUpperCase() === upperCandidate);
	if (fromValue) {
		return fromValue;
	}

	if (!candidate) {
		throw new Error('IBPS_USER is empty after normalization.');
	}

	// Allow pass-through for unmapped but valid environment-driven users.
	return candidate;
}
