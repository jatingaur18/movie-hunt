import logo from '../assets/mhbc.jpg'; // Make sure to replace with the actual path to your logo
import React, { useState, useEffect, useRef } from "react";

function Card() {
  const [movie, setMovie] = useState({});
  const [name, setName] = useState("");
  const [words, setWords] = useState([]);
  const [guess, setGuess] = useState([]);
  const [hint, setHint] = useState(0);
  const [guessed, setGuessed] = useState(false);
  const [ref, setRef] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const inputRefs = useRef([]);

  const checkGuess = () => {
    const currentGuess = guess.flat().join("");
    if (currentGuess === name) {
      setGuessed(true);
    } else {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 2000); // Popup will disappear after 2 seconds
    }
  };

  const handleKeyDown = (e, wordIndex, charIndex) => {
    if (e.key === 'Backspace') {
      const newGuess = [...guess];
      if (ref[wordIndex][charIndex]) {
        return;
      }
      if (newGuess[wordIndex][charIndex]) {
        newGuess[wordIndex][charIndex] = "";
        setGuess(newGuess);
        return;
      }
      if (charIndex > 0) {
        charIndex--;
      } else if (wordIndex > 0) {
        wordIndex--;
        charIndex = inputRefs.current[wordIndex].length - 1;
      }

      while (ref[wordIndex][charIndex]) {
        if (charIndex > 0) {
          charIndex--;
        } else if (wordIndex > 0) {
          wordIndex--;
          charIndex = inputRefs.current[wordIndex].length - 1;
        } else {
          break;
        }
      }

      if (!ref[wordIndex][charIndex]) {
        newGuess[wordIndex][charIndex] = "";
        setGuess(newGuess);
        inputRefs.current[wordIndex][charIndex].focus();
      }
    }
  };

  const handleInputChange = (e, wordIndex, charIndex) => {
    const value = e.target.value.toLowerCase();
    const newGuess = [...guess];
    
    if (!ref[wordIndex][charIndex]) {
      if (value.match(/^[a-z0-9]$/)) {
        newGuess[wordIndex][charIndex] = value;
        setGuess(newGuess);
      }

      if (charIndex < newGuess[wordIndex].length - 1) {
        charIndex++;
      } else if (wordIndex < newGuess.length - 1) {
        wordIndex++; charIndex = 0;
      }

      while (ref[wordIndex][charIndex]) {
        if (charIndex < newGuess[wordIndex].length - 1) {
          charIndex++;
        } else if (wordIndex < newGuess.length - 1) {
          wordIndex++; charIndex = 0;
        } else { break; }
      }

      if (!ref[wordIndex][charIndex]) {
        inputRefs.current[wordIndex][charIndex].focus();
      }
    }
  };

  const revealLetterHints = () => {
    const newGuess = [...guess];
    const reff = [...ref];

    let revealed = false;
    while (!revealed) {
      const i = Math.floor(Math.random() * words.length);
      const j = Math.floor(Math.random() * words[i].length);

      if (!reff[i][j]) {
        newGuess[i][j] = words[i][j];
        reff[i][j] = true;
        setRef(reff);
        revealed = true;
      }
    }

    setGuess(newGuess);

    if (newGuess.flat().join("") === name) {
      setGuessed(true);
    }
  };

  const filterAlphaNumeric = (title) => {
    return title.replace(/[^a-z0-9]/gi, "");
  };

  const convertToWords = (title) => {
    return title.toLowerCase().match(/[a-z0-9]+/g) || [];
  };

  const fetchMovie = async () => {
    try {
      const response = await fetch("https://movie-hunt-chi.vercel.app/api/movie");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from the server.");
      }

      const movieData = await response.json();
      console.log(movieData);

      setMovie(movieData);
      const titleNormalized = filterAlphaNumeric(movieData.title.toLowerCase());
      const wordArray = convertToWords(movieData.title.toLowerCase());
      setName(titleNormalized);
      setWords(wordArray);

      let reff = [];
      for (let i = 0; i < wordArray.length; i++) {
        let a = [];
        for (let j = 0; j < wordArray[i].length; j++) {
          a.push(false);
        }
        reff.push(a);
      }
      setRef(reff);
      setGuess(wordArray.map((word) => Array(word.length).fill("")));

    } catch (error) {
      console.error('Error fetching movie data:', error);
      alert('Failed to fetch movie data. Please try again later.');
    }
  };

  const Reveal_hints = () => {
    setHint(hint + 1);
    if (hint >= 2) {
      revealLetterHints();
    }
  };

  const shareScore = () => {
    const shareText = `I guessed the movie '${movie.title}' using ${hint} hints! Can you do better? Check it out at https://movie-hunt-op34.vercel.app/`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Score copied to clipboard!");
    });
  };

  const refreshPage = () => {
    window.location.reload();
  };

  useEffect(() => {
    fetchMovie();
  }, []);

  return (
    <div className="max-w-lg mx-auto my-10 p-6 rounded-lg shadow-md bg-gray-800 text-white">
      {showPopup && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded shadow-lg transition-all duration-300">
          Incorrect guess! Try again.
        </div>
      )}
      <div className="text-center mb-4 rounded">
        <img src={logo} alt="Logo" className="mx-auto" />
      </div>
      {!guessed ? (
        <>
          <h2 className="text-xl font-semibold mb-4 text-center">{movie.overview}</h2>
          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {words.map((word, wordIndex) => (
              <div key={wordIndex} className="flex space-x-2">
                {word.split("").map((char, charIndex) => (
                  <input
                    key={charIndex}
                    type="text"
                    maxLength={1}
                    ref={(el) => {
                      if (!inputRefs.current[wordIndex]) {
                        inputRefs.current[wordIndex] = [];
                      }
                      inputRefs.current[wordIndex][charIndex] = el;
                    }}
                    value={guess[wordIndex][charIndex]}
                    onChange={(e) => handleInputChange(e, wordIndex, charIndex)}
                    onKeyDown={(e) => handleKeyDown(e, wordIndex, charIndex)}
                    className="w-10 h-10 border-b-2 border-gray-500 text-center bg-transparent text-lg font-mono focus:outline-none"
                    disabled={guessed}
                    style={{ color: 'white' }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={checkGuess}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all duration-300"
            >
              Guess
            </button>
            <button
              onClick={Reveal_hints}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600 transition-all duration-300"
            >
              Reveal Hint
            </button>
            <button
              onClick={refreshPage}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition-all duration-300"
            >
              Next
            </button>
          </div>
          {hint > 0 && (
            <h2 className="mt-4 text-lg font-bold text-center">
              Year: {movie.year}
            </h2>
          )}
          {hint > 1 && (
            <h2 className="mt-2 text-lg font-bold text-center">
              Genre: {movie.genres.join(", ")}
            </h2>
          )}
        </>
      ) : (
        <div className="mt-8">
          <div className="bg-gray-900 text-white p-4 rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-semibold mb-4">{movie.title}</h2>
            <img 
              src={movie.poster_img} 
              alt={movie.title} 
              className="mx-auto mb-4 w-64 h-96 object-cover rounded-lg shadow-md"
            />
            <p className="text-lg font-medium">Score: {hint}</p>
          </div>
          <div className="flex justify-center space-x-4 mt-4">
            <button
              onClick={shareScore}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500 transition-all duration-300"
            >
              Share Score
            </button>
            <button
              onClick={refreshPage}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-500 transition-all duration-300"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;
