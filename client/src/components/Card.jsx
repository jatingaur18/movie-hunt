import React, { useState, useEffect, useRef } from "react";

function Card() {
  const [movie, setMovie] = useState({});
  const [name, setName] = useState("");
  const [words, setWords] = useState([]);
  const [guess, setGuess] = useState([]);
  const [hint, setHint] = useState(0);
  const [guessed, setGuessed] = useState(false);
  const [ref,setRef] = useState([]);
  const inputRefs = useRef([]);

  const checkGuess = () => {
    const currentGuess = guess.flat().join("");
    if (currentGuess === name) {
      setGuessed(true);
    }
  };
  const handleKeyDown=(e, wordIndex, charIndex)=>{
    if (e.key === 'Backspace'){
      const newGuess = [...guess];
        if(ref[wordIndex][charIndex]){
          return;
        }
        if(newGuess[wordIndex][charIndex]){
          newGuess[wordIndex][charIndex] = "";
          setGuess(newGuess);
          return;
        }
        if(charIndex>0){charIndex--;}
        else if(wordIndex>0){wordIndex--; charIndex= inputRefs.current[wordIndex].length - 1;}

        while(ref[wordIndex][charIndex]){
          if(charIndex>0){charIndex--;}
          else if(wordIndex>0){wordIndex--; charIndex= inputRefs.current[wordIndex].length - 1;}
          else{
            break;
          }
        }

        if(!ref[wordIndex][charIndex]){
          newGuess[wordIndex][charIndex]="";
          setGuess(newGuess);
          inputRefs.current[wordIndex][charIndex].focus();
        }
        // if (charIndex > 0) {
        //   newGuess[wordIndex][charIndex-1] = "";
        //   setGuess(newGuess);
        //   inputRefs.current[wordIndex][charIndex - 1].focus();
        // } else if (wordIndex > 0) {
        //   const prevWordIndex = wordIndex - 1;
        //   const prevCharIndex = inputRefs.current[prevWordIndex].length - 1;
        //   newGuess[prevWordIndex][prevCharIndex] = "";
        //   setGuess(newGuess);
        //   inputRefs.current[prevWordIndex][prevCharIndex].focus();
        // }

    }
  }

  const handleInputChange = (e, wordIndex, charIndex) => {
    const value = e.target.value.toLowerCase();
    console.log("value");
    const newGuess = [...guess];
    
    if(!ref[wordIndex][charIndex]){
      if (value.match(/^[a-z0-9]$/)) {
        newGuess[wordIndex][charIndex] = value;
        setGuess(newGuess);
    }

      // Move to the next input field
      if (charIndex < newGuess[wordIndex].length - 1) {
        charIndex++;
      } else if (wordIndex < newGuess.length - 1) {
        wordIndex++;charIndex=0;
      }

      while(ref[wordIndex][charIndex]){
        if (charIndex < newGuess[wordIndex].length - 1) {
          charIndex++;
        } else if (wordIndex < newGuess.length - 1) {
          wordIndex++;charIndex=0;
        }
        else{break;}
      }
      if(!ref[wordIndex][charIndex]){
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
        reff[i][j]=true;
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
    
    const response= await fetch('/api/movie',{
      method:"GET",
    });

    const movieData = await response.json();
    setMovie(movieData);
    const titleNormalized = filterAlphaNumeric(movieData.title.toLowerCase());
    const wordArray = convertToWords(movieData.title.toLowerCase());
    setName(titleNormalized);
    setWords(wordArray);
    let reff=[];
    for(let i=0;i<wordArray.length;i++){
      let a=[];
      for(let j=0;j<wordArray[i].length;j++){
        a.push(false);
      }
      reff.push(a);
    }
    setRef(reff);
    setGuess(wordArray.map((word) => Array(word.length).fill("")));
  };

  const Reveal_hints = () => {
    setHint(hint + 1);
    if (hint >= 2) {
      revealLetterHints();
    }
  };

  const shareScore = () => {
    const shareText = `I guessed the movie '${movie.title}' using ${hint} hints! Can you do better? Check it out at [WEBSITE LINK]`;
    navigator.clipboard.writeText(shareText).then(() => {
      alert("Score copied to clipboard!");
    });
  };

  useEffect(() => {
    fetchMovie();
  }, []);

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-100 text-gray-900 rounded-lg shadow-md">
    <div>GUESS THE SCREEN</div>
      {!guessed ? (
        <>
          <h2 className="text-xl font-semibold mb-4">{movie.overview}</h2>
          <div className="flex flex-wrap gap-2 mb-4">
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
                    onKeyDown={(e)=>handleKeyDown(e, wordIndex, charIndex)}
                    className="w-10 h-10 border-b-2 border-gray-900 text-center bg-transparent text-lg font-mono focus:outline-none"
                    disabled={guessed}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex space-x-4">
            <button
              onClick={checkGuess}
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-300"
            >
              Guess
            </button>
            <button
              onClick={Reveal_hints}
              className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-gray-700 transition-all duration-300"
            >
              Reveal Hint
            </button>
          </div>
          {hint > 0 && (
            <h2 className="mt-4 text-lg font-bold">Year: {movie.year}</h2>
          )}
          {hint > 1 && (
            <h2 className="mt-2 text-lg font-bold">
              Genre: {movie.genres.join(", ")}
            </h2>
          )}
        </>
      ) : (
        <div className="text-center">
          <div className="flip-card">
            <div className="flip-card-inner">
              <div className="flip-card-front">
                {/* Front of the card */}
              </div>
              <div className="flip-card-back">
                {/* Back of the card */}
                <img
                  src={movie.poster_img}
                  alt={movie.title}
                  className="w-full mt-4 rounded-lg"
                />
                <h2 className="mt-4 text-xl font-bold">{movie.title}</h2>
                <h3 className="mt-2 text-lg font-bold">
                  Score: {hint} hints used
                </h3>
                <button
                  onClick={shareScore}
                  className="bg-blue-600 text-white px-4 py-2 rounded mt-4 hover:bg-blue-500 transition-all duration-300"
                >
                  Share your score!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Card;




