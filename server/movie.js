import fetch from 'node-fetch';

const tmdb_api = process.env.TMDB_API;

const movie = async(id) => {
    var tmdb_api=process.env.TMDB_API;
    const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${tmdb_api}`
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