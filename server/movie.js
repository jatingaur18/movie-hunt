import fetch from 'node-fetch';

const tmdb_api = process.env.TMDB_API;

const movie = async(id) => {
    const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MWZlZWI2YzNhMjJjMjgwYzEzNTQwYTVkMjJkMTdkZiIsIm5iZiI6MTcyMzA0MzQzMi40MDk3NSwic3ViIjoiNjZhYjdjNGZiYTM0OGMxYWY5MGIxYzdjIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.8MrqEdWpzqTczk8pwWAGCPiJF7W9AqzESZsqz7wnxYw'
    }
    };

    fetch(url, options)
    .then(res => res.json())
    .then(json => console.log(json))
    .catch(err => console.error(err));


    try {
        const res = await fetch(url, options);
        const json = await res.json();
        console.log(json);
        return json;
    } catch (err) {
        console.error('error:' + err);
        return [];
    }
}

export default movie;