import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const { data, error } = await supabaseAdmin.from('books').select('*');

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json(data);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { data, error } = await supabaseAdmin.from('books').insert(body).select().single();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json(data, { status: 201 });
};

export const PUT: RequestHandler = async ({ request }) => {
	const body = await request.json();
	const { id, ...updateData } = body;

	if (!id) {
		return json({ error: 'Book ID is required' }, { status: 400 });
	}

	const { data, error } = await supabaseAdmin
		.from('books')
		.update(updateData)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		return json({ error: error.message }, { status: 500 });
	}

	return json(data);
};
