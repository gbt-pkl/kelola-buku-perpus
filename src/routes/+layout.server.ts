import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals: { user, role } }) => {
	return {
		user: user ? { id: user.id, email: user.email ?? null } : null,
		role
	};
};
