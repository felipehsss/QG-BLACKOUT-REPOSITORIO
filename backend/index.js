import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import funcionariosRoutes from './routes/funcionariosRoutes.js';
import lojasRoutes from './routes/lojasRoutes.js';
import produtosRoutes from './routes/produtosRoutes.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/lojas', lojasRoutes);
app.use('/api/produtos', produtosRoutes);

app.get('/', (req, res) => res.json({ message: 'API QG funcionando 🚀' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT} 🚀`));
