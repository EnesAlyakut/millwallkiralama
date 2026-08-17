import {getSettings} from '@/lib/site';export async function GET(){return Response.json(await getSettings())}
