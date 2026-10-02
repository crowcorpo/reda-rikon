
import express from 'express';
const app = express();

app.get('/koko', (req, res) => {
    res.send('koko from the backend!');
});

app.get('/text', (req, res) => {
    res.send('text from the backend!');
});

app.delete('/del', (req, res) => {
    res.send('only love can hurt like thiiisss');
});

app.listen(3000, () => {
    console.log('koko is running on port 3000');
});