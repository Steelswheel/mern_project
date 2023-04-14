import express from 'express';
import config from 'config';
import mongoose from 'mongoose';
import { router } from './routes/auth.routes';

const app = express();

const PORT: number = config.get('port') || 5000;
const MONGO_URI: string = config.get('mongoUri');

app.use('/api/auth', router);

app.get('/', (req, res) => {
    res.send('Hello World!');
});

async function start() {
    try {
        await mongoose.connect(MONGO_URI);

        app.listen(PORT, () => {
            return console.log(`Express is listening at http://localhost:${PORT}`);
        });
    } catch(e) {
        console.log(`Возникла ошибка сервера: ${e.message}`);
        process.exit(1);
    }
}

start();