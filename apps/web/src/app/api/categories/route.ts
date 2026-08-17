import {db} from '@/lib/db';export async function GET(){return Response.json(await db.category.findMany({where:{isActive:true},orderBy:{sortOrder:'asc'}}))}
