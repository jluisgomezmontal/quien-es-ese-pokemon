"use client";

import { useEffect, useState } from "react";

interface PokemonData {
  name: string;
  sprites: {
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
}

export default function Home() {
  const [pokemon, setPokemon] = useState<PokemonData | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const getRandomId = (excludeIds: number[] = []): number => {
    let id;
    do {
      id = Math.floor(Math.random() * 151) + 1;
    } while (excludeIds.includes(id));
    return id;
  };

  const getPokemon = async () => {
    try {
      setLoading(true);
      setSelectedAnswer(null);
      setIsCorrect(null);

      const mainId = getRandomId();
      const fakeId1 = getRandomId([mainId]);
      const fakeId2 = getRandomId([mainId, fakeId1]);
      const [resMain, resFake1, resFake2] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon/${mainId}`).then((r) => r.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon/${fakeId1}`).then((r) => r.json()),
        fetch(`https://pokeapi.co/api/v2/pokemon/${fakeId2}`).then((r) => r.json()),
      ]);

      setPokemon(resMain);

      const allOptions = [resMain.name, resFake1.name, resFake2.name];
      const shuffledOptions = allOptions.sort(() => Math.random() - 0.5);

      setOptions(shuffledOptions);
    } catch (error) {
      console.error("Error fetching Pokémon data:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getPokemon();
  }, []);

  const handleAnswerClick = (name: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(name);
    setIsCorrect(name === pokemon?.name);
  };

  return (
    <div className="flex min-h-screen w-screen flex-col items-center justify-center bg-stone-50 gap-10 p-6 text-stone-800 font-sans antialiased tracking-tight">
      <h1 className="font-serif italic text-3xl md:text-4xl text-center text-stone-900 tracking-wide select-none">
        ¿Quién es este Pokémon?
      </h1>
      <div className="bg-white border border-stone-200/60 p-8 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.03)] flex flex-col items-center gap-8 min-w-[340px] max-w-sm w-full transition-all duration-500">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-6 h-6 border-[2px] border-stone-200 border-t-stone-800 rounded-full animate-spin" />
            <p className="text-xs tracking-widest uppercase text-stone-400 font-medium">Cargando...</p>
          </div>
        ) : (
          <>
            {pokemon?.sprites.other["official-artwork"].front_default && (
              <div className="relative bg-stone-100/60 border border-stone-200/30 p-6 rounded-xl w-full flex justify-center items-center h-48 overflow-hidden">
                <img
                  src={pokemon.sprites.other["official-artwork"].front_default}
                  alt="Misterioso"
                  className={`w-36 h-36 object-contain transition-all duration-700 ease-out ${selectedAnswer
                    ? "brightness-100 opacity-100 filter-none scale-105"
                    : "brightness-0 opacity-10 contrast-125 scale-100"
                    }`}
                />
              </div>
            )}

            {selectedAnswer && (
              <p className={`text-xs uppercase tracking-widest font-bold animate-fade-in ${isCorrect ? "text-emerald-600" : "text-stone-400"}`}>
                {isCorrect ? "Acierto correcto —" : `Respuesta: ${pokemon?.name}`}
              </p>
            )}
            <div className="flex flex-col gap-3 w-full">
              {options.map((name, index) => {
                const isCurrentSelection = selectedAnswer === name;
                const isCorrectAnswer = pokemon?.name === name;
                let buttonStyles = "bg-transparent border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-400 hover:text-stone-900";
                if (selectedAnswer) {
                  if (isCorrectAnswer) {
                    buttonStyles = "bg-emerald-50/50 border-emerald-400 text-emerald-800 font-semibold";
                  } else if (isCurrentSelection && !isCorrectAnswer) {
                    buttonStyles = "bg-stone-100 border-stone-300 text-stone-400 line-through";
                  } else {
                    buttonStyles = "bg-transparent border-stone-100 text-stone-300 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswerClick(name)}
                    className={`w-full text-sm capitalize border font-medium py-3.5 px-6 rounded-lg transition-all duration-300 text-center tracking-wide ${!selectedAnswer && "active:scale-[0.99] cursor-pointer"
                      } ${buttonStyles}`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <button
        onClick={getPokemon}
        className="bg-stone-900 hover:bg-stone-800 text-stone-50 font-medium text-xs tracking-widest uppercase px-7 py-3.5 rounded-lg shadow-sm transition-all duration-300 active:scale-95 cursor-pointer"
      >
        Siguiente Pokémon
      </button>
    </div>
  );
}
