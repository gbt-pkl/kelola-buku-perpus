/** Role yang disimpan pada tabel `profiles`. */
export const USER_ROLES = ['admin', 'user'] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = 'user';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
	admin: 'Admin',
	user: 'User'
};

export function isUserRole(value: unknown): value is UserRole {
	return typeof value === 'string' && (USER_ROLES as readonly string[]).includes(value);
}

/**
 * Parse role dari input form. Nilai yang tidak dikenal ditolak agar tidak
 * tersimpan role bebas ke database.
 */
export function parseUserRole(value: unknown): UserRole | null {
	if (isUserRole(value)) return value;
	if (typeof value !== 'string') return null;
	return isUserRole(value.trim().toLowerCase()) ? (value.trim().toLowerCase() as UserRole) : null;
}
