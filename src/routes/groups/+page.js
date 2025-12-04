export async function load({ fetch }) {
	const res = await fetch('/api/groups');
	const groups = await res.json();

	return { groups };
}
