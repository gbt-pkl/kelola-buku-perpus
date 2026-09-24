<script lang="ts">
	import { onMount } from 'svelte';
	import BookGrid from '$lib/components/BookGrid.svelte';
	import BookCard from '$lib/components/BookCard.svelte';

	let theme = $state('light');
	let books = $state<any[]>([]);

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
		const savedTheme = localStorage.getItem('theme') || 
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
		<button
			onclick={toggleTheme}
			class="rounded-full bg-gray-200 px-4 py-2 font-medium text-gray-800 transition hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
		>
			{theme === 'light' ? '🌙' : '☀️'}
		</button>
	</header>

	<BookGrid>
		{#each books as book (book.id)}
			<BookCard {book} />
		{/each}
	</BookGrid>
</main>
