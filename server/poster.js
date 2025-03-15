import fetch from 'node-fetch';
const tmdb_api=process.env.TMDB_API;


const poster = async(id)=>{

    const url = `https://api.themoviedb.org/3/movie/${id}/images`;
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3MWZlZWI2YzNhMjJjMjgwYzEzNTQwYTVkMjJkMTdkZiIsIm5iZiI6MTcyMzA0MzQzMi40MDk3NSwic3ViIjoiNjZhYjdjNGZiYTM0OGMxYWY5MGIxYzdjIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.8MrqEdWpzqTczk8pwWAGCPiJF7W9AqzESZsqz7wnxYw'
  }
};

    try {
        const res = await fetch(url, options);
        const json = await res.json();
        console.log(json)
        if(json.posters.length===0){
            return json.backdrops[0].file_path; 
        }
        return json.posters[0].file_path;
    } catch (err) {
        console.error('error:' + err);
        return null;
    }
} 

export default poster;