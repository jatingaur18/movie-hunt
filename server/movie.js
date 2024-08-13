import fetch from 'node-fetch';

const tmdb_api=process.env.TMDB_API;

const movie = async(id)=>{const url = `https://api.themoviedb.org/3/movie/${id}?language=en-US`;
    const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${tmdb_api}`
    }
    };

    try {
        const res = await fetch(url, options);
        const json = await res.json();
        return json;
    } catch (err) {
        console.error('error:' + err);
        return [];
    }
}

export default movie;