import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, user } }) => {
	const [books, users, borrowingClass, borrowingIndividual] = await Promise.all([
		supabase.from('books').select('id, stock', { count: 'exact' }),
		supabase.from('profiles').select('id', { count: 'exact', head: true }),
		supabase.from('borrowing_class').select('id, quantity', { count: 'exact' }),
		supabase.from('borrowing_individual').select('id, quantity', { count: 'exact' })
	]);

	if (books.error || users.error || borrowingClass.error || borrowingIndividual.error) {
		console.error('[admin/dashboard] gagal mengambil statistik:', {
			books: books.error?.message,
			users: users.error?.message,
			borrowingClass: borrowingClass.error?.message,
			borrowingIndividual: borrowingIndividual.error?.message
		});
	}

	const stock = (books.data ?? []).reduce((total, book) => total + (book.stock ?? 0), 0);
	const borrowedQuantity = [
		...(borrowingClass.data ?? []),
		...(borrowingIndividual.data ?? [])
	].reduce((total, item) => total + (item.quantity ?? 0), 0);

	return {
		email: user?.email ?? null,
		stats: {
			books: books.count ?? 0,
			stock,
			users: users.count ?? 0,
			borrowings: (borrowingClass.count ?? 0) + (borrowingIndividual.count ?? 0),
			borrowedQuantity
		}
	};
};

export const actions = {
	// Form action `?/logout`: hapus cookie sesi lalu arahkan ke halaman login.
	logout: async (event) => {
		await event.locals.supabase.auth.signOut();
		redirect(303, '/login');
	}
} satisfies Actions;
