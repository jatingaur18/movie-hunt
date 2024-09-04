import fetch from 'node-fetch';
import poster from './poster.js';
import movie from './movie.js';

const tmdb_api=process.env.TMDB_API;

const removeNames = (overview) => {
    const namePatterns = /(\b[A-Z][a-z]*\b)/g;
    return overview.replace(namePatterns, '___');
};

const movie_list = async (year,page) => {
    const url = `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=${page}&primary_release_year=${year}&region=IN&sort_by=popularity.desc&vote_count.gte=0&with_origin_country=IN&with_original_language=hi`;
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
        // console.log(json);
        return json.results;
    } catch (err) {
        console.error('error:' + err);
        return [];
    }
};

const movie_today = async () => {
    try {
        const fin_movie={
            id:null,
            title:null,
            year:null,
            genres:[],
            poster_img:null,
            overview:null
        }
        const currentYear = new Date().getFullYear();
        const year = Math.floor(Math.random() * (currentYear - 1990)) + 1990;
        const arr_page1 = await movie_list(year,1);
        const arr_page2 = await movie_list(year,2);
        const arr_page3 = await movie_list(year,3);
        const arr = arr_page1.concat(arr_page2, arr_page3);
        const l = arr.length;
        if (l === 0) {
            console.log('No movies found');
            return;
        }
        const ind = Math.floor(Math.random() * l);
        const mov=await movie(arr[ind].id)
        // console.log(mov);
        fin_movie.id=mov.id
        fin_movie.title=mov.title
        fin_movie.year=year
        fin_movie.poster_img= "https://image.tmdb.org/t/p/original" + await poster(mov.id);
        for(let i =0;i<mov.genres.length;i++){
            fin_movie.genres.push(mov.genres[i].name);
        }
        fin_movie.overview=removeNames(mov.overview);
        console.log(fin_movie)
        return fin_movie;
    }
    catch(error){
        console.error("error",error);
    }
};
// movie_today(2010);
// module.exports = main;
export default movie_today
