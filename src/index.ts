import express from 'express';
import dotenv from 'dotenv';
import { getEnvVariable, } from './utils/env.js';

import UserRoutes from "./routes/UserRoutes.js";
import HealthCheck from "./routes/HealthCheck.js";
// import { getTableNames, checkDbConnection, } from './checkDbConnection.js';

const app = express();

dotenv.config();

const port = getEnvVariable('PORT',);

app.use(express.json(),);
app.use('/api/users', UserRoutes,);
app.use('/api', HealthCheck,);

// checkDbConnection();
// getTableNames();

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`,);
},);
