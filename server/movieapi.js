import fetch from 'node-fetch';
import poster from './poster.js';
import movie from './movie.js';
const removeNames = (overview) => {
    const namePatterns = /(\b[A-Z][a-z]*\b)/g;
    return overview.replace(namePatterns, '___');
};

const movie_list = async (year, page) => {
    var tmdb_api=process.env.TMDB_API;
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
        return json.results || [];
    } catch (err) {
        console.error('Error in movie_list:', err);
        return [];
    }
};

const movie_today = async () => {
    const fin_movie = {
        id: null,
        title: null,
        year: null,
        genres: [],
        poster_img: null,
        overview: null
    };

    try {
        const currentYear = new Date().getFullYear();
        const year = Math.floor(Math.random() * (currentYear - 1990)) + 1990;
        
        // Initialize array to store results
        let arr = [];
        
        // Fetch and log each page result
        const arr_page1 = await movie_list(year, 1);
        console.log('Page 1 results:', Array.isArray(arr_page1) ? arr_page1.length : 'invalid');
        if (Array.isArray(arr_page1)) arr = arr.concat(arr_page1);
        
        const arr_page2 = await movie_list(year, 2);
        console.log('Page 2 results:', Array.isArray(arr_page2) ? arr_page2.length : 'invalid');
        if (Array.isArray(arr_page2)) arr = arr.concat(arr_page2);
        
        const arr_page3 = await movie_list(year, 3);
        console.log('Page 3 results:', Array.isArray(arr_page3) ? arr_page3.length : 'invalid');
        if (Array.isArray(arr_page3)) arr = arr.concat(arr_page3);
        
        console.log('Final array length:', arr.length);
        
        // Safety check for array
        if (!Array.isArray(arr)) {
            console.error('Array is not valid after concatenation');
            return fin_movie;
        }

        // Direct length check instead of filter
        const totalMovies = arr.length;
        console.log('Total movies before selection:', totalMovies);

        if (arr.length === 0) {
            console.log('No movies found');
            return fin_movie;
        }

        // Safe random selection
        const ind = Math.floor(Math.random() * totalMovies);
        console.log('Selected index:', ind);
        
        // Verify selected movie exists
        if (!arr[ind]) {
            console.error('Selected movie is undefined at index:', ind);
            return fin_movie;
        }

        const selectedMovie = arr[ind];
        console.log('Selected movie ID:', selectedMovie.id);

        const mov = await movie(selectedMovie.id);
        console.log("mov -> ",mov)
        
        if (!mov) {
            console.log('Movie details not found');
            return fin_movie;
        }

        // Safe assignments with logging
        fin_movie.id = mov.id || null;
        fin_movie.title = mov.title || null;
        fin_movie.year = year;
        console.log(fin_movie)
        const posterPath = await poster(mov.id);
        fin_movie.poster_img = posterPath 
            ? `https://image.tmdb.org/t/p/original${posterPath}`
            : null;
        
        // Safe genre processing
        if (mov.genres && Array.isArray(mov.genres)) {
            fin_movie.genres = mov.genres
                .map(genre => genre?.name)
                .filter(Boolean);
        }
        
        fin_movie.overview = (mov.overview) || null;
        
        console.log('Successfully created fin_movie object');
        return fin_movie;

    } catch(error) {
        console.error('Error in movie_today:', error);
        console.error('Error stack:', error.stack);
        return fin_movie;
    }
};

export default movie_today;