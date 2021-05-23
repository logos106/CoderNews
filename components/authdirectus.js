import { Directus, MemoryStorage, AxiosTransport, Auth } from '@directus/sdk'
const url = "http://192.168.8.141:8055"
let memory = new MemoryStorage()
const transport = new AxiosTransport(url, memory, async () => {
	await auth.refresh(); // This is how axios checks for refresh
});

const auth = new Auth(transport, memory, {
    mode: 'json',
});

const directus = new Directus(url, {
	auth,
	memory,
	transport,
});

export default directus;