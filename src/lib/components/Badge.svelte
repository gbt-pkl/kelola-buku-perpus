<script lang="ts">
	let { isAvailable } = $props<{ isAvailable: boolean }>();
</script>

<span
	class="rounded-full px-2 py-1 text-xs font-bold {isAvailable
		? 'bg-green-100 text-green-800'
		: 'bg-gray-100 text-gray-800'}"
>
	{isAvailable ? 'Tersedia' : 'Habis'}
</span>
