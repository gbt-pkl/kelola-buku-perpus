import { json } from '@sveltejs/kit';
import { supabaseAdmin } from '$lib/server/supabase';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { type, book_id, quantity, student_name, class_leader } = body;

    if (!type || !book_id || !quantity) {
        return json({ error: 'type, book_id, and quantity are required' }, { status: 400 });
    }

    const table = type === 'individual' ? 'borrowing_individual' : 'borrowing_class';
    const borrowData = type === 'individual' 
        ? { book_id, quantity, student_name }
        : { book_id, quantity, class_leader };

    if (type === 'individual' && !student_name) return json({ error: 'student_name required for individual' }, { status: 400 });
    if (type !== 'individual' && !class_leader) return json({ error: 'class_leader required for class' }, { status: 400 });

    const { data, error } = await supabaseAdmin
        .from(table)
        .insert(borrowData)
        .select()
        .single();

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    return json(data, { status: 201 });
};

export const PATCH: RequestHandler = async ({ request }) => {
    const body = await request.json();
    const { id, type, ...updateData } = body;

    if (!id || !type) {
        return json({ error: 'ID and type (individual/class) are required' }, { status: 400 });
    }

    const table = type === 'individual' ? 'borrowing_individual' : 'borrowing_class';

    const { data, error } = await supabaseAdmin
        .from(table)
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        return json({ error: error.message }, { status: 500 });
    }

    return json(data);
};
