import fetch from 'node-fetch';


const poster = async(id)=>{
    
    var tmdb_api=process.env.TMDB_API;
    const url = `https://api.themoviedb.org/3/movie/${id}/images`;
const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${tmdb_api}`
  }
};

    try {
        console.log(options);
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