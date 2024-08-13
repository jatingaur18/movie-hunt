import fetch from 'node-fetch';
const tmdb_api=process.env.TMDB_API;


const poster = async(id)=>{

    const url = `https://api.themoviedb.org/3/movie/${id}/images?include_image_language=en%2Cnull`;
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
        // console.log(json)
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