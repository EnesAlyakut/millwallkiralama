import { GET } from './src/app/api/admin/assign-images/route';

GET(new Request('http://localhost')).then(async (res) => {
  console.log(await res.json());
  process.exit(0);
}).catch(console.error);
