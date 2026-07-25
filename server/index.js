import express    from 'express';
import bodyParser from 'body-parser';
import cors       from 'cors';
import dotenv     from 'dotenv';
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';
import { initializeDatabase } from './config/mysql.js';

dotenv.config();
const app = express();

app.use(bodyParser.json({ limit: '10mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cors({ origin: '*', credentials: true }));

app.use('/posts', postRoutes);
app.use('/auth',  authRoutes);

app.get('/health', (_, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT_NUM || 5000;

initializeDatabase()
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`)))
  .catch((err) => { console.error('DB init failed:', err); process.exit(1); });
