import express from "express";
import movie_today from "./movieapi.js";
import dotenv from "dotenv";

dotenv.config({
    path: "./env"
});

import cors from "cors"; 

const port = process.env.PORT || 3000;
const app = express();

app.use(cors({
    origin: "https://movie-hunt-op34.vercel.app", // Replace with your frontend URL
  }));
const runMain = async () => {
    let movie = await movie_today();
    return movie;
};

app.get('/api/movie', async (req, res) => {
    try {
        console.log("good")
        const movie = await runMain();
        res.send(movie);
    } catch (error) {
        console.log("bad")
        res.status(500).send({ error: 'Failed to fetch movie data' });
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
