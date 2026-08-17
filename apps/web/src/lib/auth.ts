import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
const key=()=>new TextEncoder().encode(process.env.JWT_SECRET||'development-only-change-in-production');
export async function createSession(payload:{id:string;name:string;role:string}){const token=await new SignJWT(payload).setProtectedHeader({alg:'HS256'}).setIssuedAt().setExpirationTime('8h').sign(key());(await cookies()).set('millwal_admin',token,{httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:28800})}
export async function getSession(){try{const token=(await cookies()).get('millwal_admin')?.value;if(!token)return null;return (await jwtVerify(token,key())).payload as {id:string;name:string;role:string}}catch{return null}}
export async function clearSession(){(await cookies()).delete('millwal_admin')}
