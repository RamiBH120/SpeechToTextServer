import express from 'express';
import dotenv from 'dotenv';
import { speechToText } from './functions/speechToText';
import cors from 'cors';
import "dotenv/config";

import bodyParser from 'body-parser';
import { processSpeech } from './functions/processSpeech';

dotenv.config();

const port = process.env.PORT || 4000;


// Initialize the Express application
const app = express();
// Middleware to parse JSON bodies
app.use(express.json({
    limit: '50mb' // Increase the limit for larger audio files
}));

app.use(cors());

app.post('/api/speech-to-text', (req, res) => {
    speechToText(req, res);
});

app.get('/', (req, res) => {
  res.send('The speech is ready to be delivered!');
});

app.use(bodyParser.json());

app.post("/api/process-speech", async (req, res) => {
  processSpeech(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});