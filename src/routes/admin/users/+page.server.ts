import { fail } from '@sveltejs/kit';
import { DEFAULT_USER_ROLE, parseUserRole, type UserRole } from '$lib/auth';
import {
	createUserAccount,
	deleteUserAccount,
	listUserAccounts,
	updateUserRole
} from '$lib/server/users';
import type { Actions, PageServerLoad } from './$types';

const MIN_PASSWORD_LENGTH = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Intent = 'create' | 'update-role' | 'remove';

type FormState = {
	intent: Intent;
	message: string;
	success: boolean;
	email: string;
	role: UserRole | null;
};

function formState(
	intent: Intent,
	message: string,
	success: boolean,
	extra: Partial<Pick<FormState, 'email' | 'role'>> = {}
): FormState {
	return { intent, message, success, email: '', role: null, ...extra };
}

export const load: PageServerLoad = async () => {
	const result = await listUserAccounts();

	return {
		users: result.ok ? result.value : [],
		loadError: result.ok ? null : result.error
	};
};

export const actions = {
	// Form action `?/create`: satu-satunya cara membuat akun (tanpa registrasi publik).
	create: async (event) => {
		const form = await event.request.formData();
		const email = String(form.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(form.get('password') ?? '');
		const role = parseUserRole(form.get('role')) ?? DEFAULT_USER_ROLE;

		if (!EMAIL_PATTERN.test(email)) {
			return fail(400, formState('create', 'Format email tidak valid.', false, { email, role }));
		}

		if (password.length < MIN_PASSWORD_LENGTH) {
			return fail(
				400,
				formState('create', `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`, false, {
					email,
					role
				})
			);
		}

		const result = await createUserAccount({ email, password, role });

		if (!result.ok) {
			return fail(400, formState('create', result.error, false, { email, role }));
		}

		return formState('create', `Akun ${email} berhasil dibuat (${role}).`, true);
	},

	updateRole: async (event) => {
		const form = await event.request.formData();
		const userId = String(form.get('userId') ?? '');
		const role = parseUserRole(form.get('role'));

		if (!userId) {
			return fail(400, formState('update-role', 'User tidak valid.', false));
		}

		if (!role) {
			return fail(400, formState('update-role', 'Role tidak valid.', false));
		}

		if (userId === event.locals.user?.id) {
			return fail(400, formState('update-role', 'Role akun sendiri tidak bisa diubah.', false));
		}

		const result = await updateUserRole(userId, role);

		if (!result.ok) {
			return fail(400, formState('update-role', result.error, false));
		}

		return formState('update-role', `Role diubah menjadi ${role}.`, true);
	},

	remove: async (event) => {
		const form = await event.request.formData();
		const userId = String(form.get('userId') ?? '');

		if (!userId) {
			return fail(400, formState('remove', 'User tidak valid.', false));
		}

		if (userId === event.locals.user?.id) {
			return fail(400, formState('remove', 'Akun sendiri tidak bisa dihapus.', false));
		}

		const result = await deleteUserAccount(userId);

		if (!result.ok) {
			return fail(400, formState('remove', result.error, false));
		}

		return formState('remove', 'Akun berhasil dihapus.', true);
	}
} satisfies Actions;
