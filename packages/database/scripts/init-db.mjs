import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
const here=dirname(fileURLToPath(import.meta.url));
const db=new DatabaseSync(join(here,'../prisma/millwal.db'));
db.exec(readFileSync(join(here,'../prisma/init.sql'),'utf8'));
db.close();
