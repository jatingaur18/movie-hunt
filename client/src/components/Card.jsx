import React, { useState, useEffect, useRef } from "react";
import confetti from 'canvas-confetti';
import Keyboard from 'react-simple-keyboard';
import 'react-simple-keyboard/build/css/index.css';

function Card() {
  // State variables
  const [movie, setMovie] = useState({});
  const [name, setName] = useState(""); // Normalized movie title
  const [words, setWords] = useState([]); // Title split into words
  const [guess, setGuess] = useState([]); // 2D array of guessed letters
  const [hint, setHint] = useState(0); // Number of hints used
  const [guessed, setGuessed] = useState(false); // Whether the movie is guessed
  const [ref, setRef] = useState([]); // 2D array of revealed letters
  const [showPopup, setShowPopup] = useState(false); // Popup for incorrect guesses
  const [letter, setLetter] = useState(0); // Total number of letters
  const [cursor, setCursor] = useState({ wordIndex: 0, charIndex: 0 }); // Cursor position
  const inputRefs = useRef([]); // References to input elements
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  // Fetch movie data on mount
  useEffect(() => {
    const isMobile = () => {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };
    // isMobile();
    setIsMobileDevice(isMobile());
    const fetchMovie = async () => {
      const response = await fetch("https://movie-hunt-chi.vercel.app/api/movie");
      const movieData = await response.json();
      setMovie(movieData);
      const titleNormalized = movieData.title.toLowerCase().replace(/[^a-z0-9]/gi, "");
      const wordArray = movieData.title.toLowerCase().match(/[a-z0-9]+/g) || [];
      setName(titleNormalized);
      setWords(wordArray);
      let lett = 0;
      for (let word of wordArray) {
        lett += word.length;
      }
      setLetter(lett);
      setGuess(wordArray.map((word) => Array(word.length).fill("")));
      setRef(wordArray.map((word) => Array(word.length).fill(false)));
    };
    fetchMovie();
  }, []);

  // Set initial focus when guess is initialized
  useEffect(() => {
    if (inputRefs.current[0] && inputRefs.current[0][0]) {
      inputRefs.current[0][0].focus();
      setCursor({ wordIndex: 0, charIndex: 0 });
    }
  }, [guess]);

  // Move cursor to the next editable position
  const moveCursorForward = (currentWordIndex, currentCharIndex) => {
    let wordIndex = currentWordIndex;
    let charIndex = currentCharIndex + 1;

    if (charIndex >= guess[wordIndex].length) {
      if (wordIndex < guess.length - 1) {
        wordIndex++;
        charIndex = 0;
      } else {
        return;
      }
    }

    while (
      wordIndex < guess.length &&
      charIndex < guess[wordIndex].length &&
      ref[wordIndex][charIndex]
    ) {
      charIndex++;
      if (charIndex >= guess[wordIndex].length) {
        if (wordIndex < guess.length - 1) {
          wordIndex++;
          charIndex = 0;
        } else {
          return;
        }
      }
    }

    if (wordIndex < guess.length && charIndex < guess[wordIndex].length) {
      setCursor({ wordIndex, charIndex });
      setTimeout(() => {
        if (inputRefs.current[wordIndex] && inputRefs.current[wordIndex][charIndex]) {
          inputRefs.current[wordIndex][charIndex].focus();
        }
      }, 0);
    }
  };

  // Handle backspace functionality
  const handleBackspace = (wordIndex, charIndex) => {
    const newGuess = [...guess]; // Create a copy of the current guess state
  
    // Case 1: Current position has an editable letter
    if (newGuess[wordIndex][charIndex] && !ref[wordIndex][charIndex]) {
      newGuess[wordIndex][charIndex] = ""; // Clear the current letter
      setGuess(newGuess); // Update the guess state
      setCursor({ wordIndex, charIndex }); // Keep cursor at current position
      // Delay focus to ensure state updates first
      inputRefs.current[wordIndex][charIndex].focus();
      return;
    }
  
    // Case 2: Current position is empty, move to previous editable position
    let prevWordIndex = wordIndex;
    let prevCharIndex = charIndex - 1;
  
    while (prevWordIndex >= 0) {
      while (prevCharIndex >= 0) {
        if (!ref[prevWordIndex][prevCharIndex]) { // Check if position is editable
          newGuess[prevWordIndex][prevCharIndex] = ""; // Clear the previous letter
          setGuess(newGuess); // Update the guess state
          setCursor({ wordIndex: prevWordIndex, charIndex: prevCharIndex }); // Move cursor to previous position
          setTimeout(() => {
            if (inputRefs.current[prevWordIndex] && inputRefs.current[prevWordIndex][prevCharIndex]) {
              inputRefs.current[prevWordIndex][prevCharIndex].focus();
            }
          }, 0);
          return;
        }
        prevCharIndex--; // Move to the previous character
      }
      // Move to the previous word if we've reached the start of the current word
      if (prevWordIndex > 0) {
        prevWordIndex--;
        prevCharIndex = guess[prevWordIndex].length - 1; // Start at the last character of the previous word
      } else {
        break; // No previous positions available
      }
    }
  };

  // Handle physical keyboard input
  const handleInputChange = (e) => {
    const { wordIndex, charIndex } = cursor;
    const value = e.target.value.toLowerCase();

    if (!ref[wordIndex][charIndex] && value.match(/^[a-z0-9]$/)) {
      const newGuess = [...guess];
      newGuess[wordIndex][charIndex] = value;
      setGuess(newGuess);
      moveCursorForward(wordIndex, charIndex);
    }
    e.target.value = ""; // Clear input after processing
  };

  // Handle virtual keyboard input
  const handleKeyboardClick = (key) => {
    if (key === '{bksp}') {
      handleBackspace(cursor.wordIndex, cursor.charIndex);
      return;
    }
    const { wordIndex, charIndex } = cursor;
    if (!ref[wordIndex][charIndex] && key.match(/^[a-z0-9]$/)) {
      const newGuess = [...guess];
      newGuess[wordIndex][charIndex] = key;
      setGuess(newGuess);
      moveCursorForward(wordIndex, charIndex);
    }
  };

  // Update cursor when an input is focused
  const handleInputFocus = (wordIndex, charIndex) => {
    if (!ref[wordIndex][charIndex]) {
      setCursor({ wordIndex, charIndex });
      if (inputRefs.current[wordIndex] && inputRefs.current[wordIndex][charIndex]) {
        inputRefs.current[wordIndex][charIndex].focus();
      }
    }
  };

  // Check if the guess is correct
  const checkGuess = () => {
    const currentGuess = guess.flat().join("");
    if (currentGuess === name) {
      setGuessed(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2a9d8f', '#e76f51', '#f4a261'],
      });
    } else {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000);
    }
  };

  // Reveal hints
  const Reveal_hints = () => {
    setHint(hint + 1);
    if (hint >= 2) {
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
          setGuess(newGuess);
          revealed = true;
        }
      }
      if (newGuess.flat().join("") === name) {
        setGuessed(true);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#2a9d8f', '#e76f51', '#f4a261'],
        });
      }
    }
  };

  // Share score to clipboard
  const shareScore = () => {
    const shareText = `I guessed the movie '${movie.title}' using ${hint} hints! Can you do better? Check it out at https://movie-hunt-op34.vercel.app/`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Score copied to clipboard!");
    });
  };

  // Refresh the page for a new game
  const refreshPage = () => {
    window.location.reload();
  };

  // Helper function to determine if this cell is where the cursor is
  const isActiveCursor = (wordIndex, charIndex) => {
    return cursor.wordIndex === wordIndex && cursor.charIndex === charIndex;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#5db6a2] p-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8">
        {/* Popup for incorrect guesses */}
        {showPopup && (
          <div className="min-h-screen w-full flex items-center justify-center bg-[#5db6a2] p-4 fixed top-0 left-0 bg-opacity-50 z-10">
            <div className="bg-[#f4a261] text-[#1a3c34] px-4 py-2 rounded-md shadow-md animate-fade-in-out">
              Incorrect guess
            </div>
          </div>
        )}
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-[#1a3c34]">Movie Hunt</h1>
        </div>
        {!guessed ? (
          <>
            {/* Movie overview and letter count */}
            <div className="mb-6">
              <p className="text-sm text-[#1a3c34] leading-relaxed">{movie.overview}</p>
              <div className="flex justify-center mt-3">
                <p className="text-sm text-[#4a7c6e] font-medium">
                  Letters: {words.map(word => word.length).join("-")}
                </p>
              </div>
            </div>
            {/* Input fields */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {words.map((word, wordIndex) => (
                <div key={wordIndex} className="flex gap-1">
                  {word.split("").map((char, charIndex) => (
                    <input
                    key={charIndex}
                    type="text"
                    maxLength={1}
                    readOnly={isMobileDevice}
                    // readOnly={true}  //s This already helps prevent mobile keyboard
                    ref={(el) => {
                      if (!inputRefs.current[wordIndex]) inputRefs.current[wordIndex] = [];
                      inputRefs.current[wordIndex][charIndex] = el;
                    }}
                    value={guess[wordIndex]?.[charIndex] || ""}
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        e.preventDefault(); // Stop default backspace behavior
                        handleBackspace(wordIndex, charIndex);
                      }
                    }}
                    onFocus={() => handleInputFocus(wordIndex, charIndex)}
                    className={`w-8 h-8 rounded border text-[#1a3c34] text-center text-base font-mono transition-all duration-150 disabled:opacity-50 ${
                      isActiveCursor(wordIndex, charIndex) 
                        ? 'bg-[#b7e4d8] border-[#2a9d8f] ring-2 ring-[#2a9d8f]' 
                        : 'bg-[#e0e7e9] border-[#b0c4c1] focus:border-[#2a9d8f] focus:ring-1 focus:ring-[#2a9d8f]/50'
                    }`}
                    disabled={guessed || ref[wordIndex][charIndex]}
                  />
                  ))}
                </div>
              ))}
            </div>
            {/* Action buttons */}
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
            {/* Hints display */}
            {hint > 0 && (
              <div className="text-center mb-2 bg-[#e0e7e9] p-2 rounded">
                <p className="text-sm text-[#4a7c6e] font-medium">Year: {movie.year}</p>
              </div>
            )}
            {hint > 1 && (
              <div className="text-center mb-2 bg-[#e0e7e9] p-2 rounded">
                <p className="text-sm text-[#4a7c6e] font-medium">Genre: {movie.genres?.join(", ")}</p>
              </div>
            )}
            {/* Virtual keyboard */}
            <div className="mt-6">
              <Keyboard
                onKeyPress={handleKeyboardClick}
                layout={{ default: ["1 2 3 4 5 6 7 8 9 0","q w e r t y u i o p", "a s d f g h j k l", "z x c v b n m {bksp}"] }}
                display={{ '{bksp}': 'Backspace' }}
              />
            </div>
          </>
        ) : (
          /* Display when guessed correctly */
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