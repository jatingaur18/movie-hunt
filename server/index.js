import express from "express";
import movie_today from "./movieapi.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
});

const port = process.env.PORT || 3000;
const app = express();

const runMain = async () => {
    let movie = await movie_today();
    return movie;
};

app.get('/api/movie', async (req, res) => {
    try {
        const movie = await runMain();
        res.send(movie);
    } catch (error) {
        res.status(500).send({ error: 'Failed to fetch movie data' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
