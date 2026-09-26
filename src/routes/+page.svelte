<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';
	import BookGrid from '$lib/components/BookGrid.svelte';
	import BookCard from '$lib/components/BookCard.svelte';

	type Book = {
		id: number;
		title: string;
		grade: string;
		major: string;
		stock: number;
		cover_url?: string;
	};

	let { data } = $props();

	let theme = $state('light');
	let books = $state<Book[]>([]);

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('theme', theme);
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	async function fetchBooks() {
		const response = await fetch('/api/v1/books');
		books = await response.json();
	}

	onMount(() => {
		const savedTheme =
			localStorage.getItem('theme') ||
			(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
		theme = savedTheme;
		document.documentElement.setAttribute('data-theme', theme);
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		fetchBooks();
	});
</script>

<main class="min-h-screen bg-gray-50 p-4 transition-colors duration-300 dark:bg-gray-950">
	<header
		class="mb-8 flex items-center justify-between border-b border-gray-200 pb-4 dark:border-gray-800"
	>
		<h1 class="text-3xl font-bold text-gray-900 dark:text-white">BUKU.</h1>
		<div class="flex items-center gap-2">
			{#if data.role === 'admin'}
				<a
					href={resolve('/admin/dashboard')}
					class="rounded-full bg-gray-900 px-4 py-2 font-medium text-white transition hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
				>
					Dashboard
				</a>
			{:else}
				<a
					href={resolve('/login')}
					class="rounded-full border border-gray-300 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-200 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
				>
					Masuk
				</a>
			{/if}
			<button
				onclick={toggleTheme}
				class="rounded-full bg-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
			>
				{theme === 'light' ? '🌙' : '☀️'}
			</button>
		</div>
	</header>

	<BookGrid>
		{#each books as book (book.id)}
			<BookCard {book} />
		{/each}
	</BookGrid>
</main>
