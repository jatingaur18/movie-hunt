import React, { useState, useEffect, useRef } from "react";
import confetti from 'canvas-confetti'; // Importing the confetti library for celebration animation

function Card() {
  const [movie, setMovie] = useState({});
  const [name, setName] = useState("");
  const [words, setWords] = useState([]);
  const [guess, setGuess] = useState([]);
  const [hint, setHint] = useState(0);
  const [guessed, setGuessed] = useState(false);
  const [ref, setRef] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [letter, setLetter] = useState(0);
  const inputRefs = useRef([]);

  const checkGuess = () => {
    const currentGuess = guess.flat().join("");
    if (currentGuess === name) {
      setGuessed(true);
      // Trigger confetti animation when guessed correctly
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2a9d8f', '#e76f51', '#f4a261'],
      });
    } else {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 2000);
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
      // Trigger confetti animation when guessed correctly via hint
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2a9d8f', '#e76f51', '#f4a261'],
      });
    }
  };

  const filterAlphaNumeric = (title) => {
    return title.replace(/[^a-z0-9]/gi, "");
  };

  const convertToWords = (title) => {
    return title.toLowerCase().match(/[a-z0-9]+/g) || [];
  };

  const getLetterBreakdown = () => {
    return words.map(word => word.length).join("-");
  };

  const fetchMovie = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/movie");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Received non-JSON response from the server.");
      }

      const movieData = await response.json();

      setMovie(movieData);
      const titleNormalized = filterAlphaNumeric(movieData.title.toLowerCase());
      const wordArray = convertToWords(movieData.title.toLowerCase());
      setName(titleNormalized);
      setWords(wordArray);
      let lett = 0;
      let reff = [];
      for (let i = 0; i < wordArray.length; i++) {
        let a = [];
        for (let j = 0; j < wordArray[i].length; j++) {
          a.push(false);
          lett++;
        }
        reff.push(a);
      }
      setLetter(lett);
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#5db6a2] p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        {showPopup && (
          <div className="min-h-screen w-full flex items-center justify-center bg-[#5db6a2] p-4 fixed top-0 left-0 bg-opacity-50 z-10">
          <div className="fixed top-16 left- transform -translate-x-1/2 bg-[#f4a261] text-[#1a3c34] px-4 py-2 rounded-md shadow-md animate-fade-in-out">
            Incorrect guess
          </div>
          </div>
        )}
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#1a3c34]">Movie Hunt</h1>
        </div>

        {!guessed ? (
          <>
            <div className="mb-6">
              <p className="text-sm text-[#1a3c34] leading-relaxed">{movie.overview}</p>
              <div className="flex justify-center mt-3">
                <p className="text-sm text-[#4a7c6e] font-medium">
                  Letters: {getLetterBreakdown()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {words.map((word, wordIndex) => (
                <div key={wordIndex} className="flex gap-1">
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
                      className="w-8 h-8 rounded bg-[#e0e7e9] border border-[#b0c4c1] text-[#1a3c34] text-center text-base font-mono focus:border-[#2a9d8f] focus:ring-1 focus:ring-[#2a9d8f]/50 transition-all duration-150 disabled:opacity-50"
                      disabled={guessed}
                    />
                  ))}
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3 mb-4">
              <button
                onClick={checkGuess}
                className="px-4 py-1 rounded-full bg-[#2a9d8f] hover:bg-[#248b7e] text-white text-sm font-medium transition-all duration-200"
              >
                Guess
              </button>
              <button
                onClick={Reveal_hints}
                className="px-4 py-1 rounded-full bg-[#2a9d8f] hover:bg-[#248b7e] text-white text-sm font-medium transition-all duration-200"
              >
                Hint ({hint})
              </button>
              <button
                onClick={refreshPage}
                className="px-4 py-1 rounded-full bg-[#e76f51] hover:bg-[#d65f41] text-white text-sm font-medium transition-all duration-200"
              >
                Next
              </button>
            </div>

            {hint > 0 && (
              <div className="text-center mb-2 bg-[#e0e7e9] p-2 rounded">
                <p className="text-sm text-[#4a7c6e] font-medium">Year: {movie.year}</p>
              </div>
            )}
            {hint > 1 && (
              <div className="text-center bg-[#e0e7e9] p-2 rounded">
                <p className="text-sm text-[#4a7c6e] font-medium">Genre: {movie.genres?.join(", ")}</p>
              </div>
            )}
          </>
        ) : (
          <div>
            <div className="bg-[#e0e7e9] p-4 rounded text-center">
              <h2 className="text-lg font-medium mb-2 text-[#1a3c34]">{movie.title}</h2>
              <img 
                src={movie.poster_img} 
                alt={movie.title} 
                className="mx-auto mb-4 w-48 h-72 object-cover rounded shadow-sm border border-[#b0c4c1]"
              />
              <p className="text-sm font-medium text-[#4a7c6e]">Score: {letter - hint + 2}</p>
            </div>
            <div className="flex justify-center gap-3 mt-4">
              <button
                onClick={shareScore}
                className="px-4 py-1 rounded-full bg-[#2a9d8f] hover:bg-[#248b7e] text-white text-sm font-medium transition-all duration-200"
              >
                Share Score
              </button>
              <button
                onClick={refreshPage}
                className="px-4 py-1 rounded-full bg-[#e76f51] hover:bg-[#d65f41] text-white text-sm font-medium transition-all duration-200"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Card;