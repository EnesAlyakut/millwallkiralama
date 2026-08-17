import {getSession} from './auth';
export async function requireAdmin(){const session=await getSession();if(!session)throw new Error('UNAUTHORIZED');return session}
export function apiError(error:unknown){const message=error instanceof Error?error.message:'UNKNOWN';if(message==='UNAUTHORIZED')return Response.json({error:'Yetkisiz erişim.'},{status:401});console.error(error);return Response.json({error:'İşlem tamamlanamadı.'},{status:500})}
export function validOrigin(req:Request){const origin=req.headers.get('origin');const host=req.headers.get('host');return !origin||!host||new URL(origin).host===host}
