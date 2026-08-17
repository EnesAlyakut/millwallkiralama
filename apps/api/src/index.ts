import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
const app: express.Express=express();
app.use(helmet());
app.get('/api/health',(_,res)=>res.json({status:'ok',service:'millwal-api',timestamp:new Date().toISOString()}));
const port=Number(process.env.API_PORT||3001);
app.listen(port,()=>console.log(`Millwal API health service listening on ${port}`));
export default app;
