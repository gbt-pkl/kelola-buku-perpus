<script lang="ts">
	import Badge from './Badge.svelte';

	let { book } = $props<{
		book: {
			title: string;
			grade: string;
			major: string;
			stock: number;
			cover_url?: string;
		};
	}>();

	const isAvailable = $derived(book.stock > 0);
</script>

<div
	class="mb-4 break-inside-avoid rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
>
	{#if book.cover_url}
		<img src={book.cover_url} alt={book.title} class="mb-3 h-48 w-full rounded-md object-cover" />
	{:else}
		<div
			class="mb-3 flex h-48 items-center justify-center rounded-md bg-gray-100 text-gray-400 dark:bg-gray-700"
		>
			No Cover
		</div>
	{/if}

	<h3 class="mb-1 text-lg font-semibold text-gray-900 dark:text-gray-100">{book.title}</h3>
	<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">
		{book.grade} / {book.major}
	</p>

	<Badge {isAvailable} />
</div>
