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

  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);

  const getRandomId = (excludeIds: number[] = []): number => {
    let id;
    do {
      id = Math.floor(Math.random() * 1025) + 1;
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
    const correct = name === pokemon?.name;
    setSelectedAnswer(name);
    setIsCorrect(correct);
    if (correct) {
      setHits((h) => h + 1);
      setStreak((s) => s + 1);
    } else {
      setMisses((m) => m + 1);
      setStreak(0);
    }
  };

  return (
    <div className="relative flex min-h-screen w-screen flex-col items-center justify-center gap-8 overflow-hidden p-6 font-body">
      {/* animated scanline overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25 animate-scanline mix-blend-overlay"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.4) 3px, transparent 4px)",
          backgroundSize: "100% 200px",
        }}
      />

      <h1 className="relative z-10 select-none text-center font-display text-lg leading-relaxed text-neon-yellow [text-shadow:0_0_6px_var(--color-neon-magenta),0_0_18px_var(--color-neon-magenta)] md:text-2xl animate-flicker">
        ¿Quién es ese
        <br />
        <span className="text-neon-cyan [text-shadow:0_0_6px_var(--color-neon-cyan),0_0_22px_var(--color-neon-cyan)]">
          Pokémon?
        </span>
      </h1>

      {/* score HUD */}
      <div className="relative z-10 flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-widest md:text-xs">
        <span className="rounded-md border border-neon-green/30 bg-void-deep/70 px-3 py-1.5 text-neon-green/90 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
          Aciertos {String(hits).padStart(2, "0")}
        </span>
        <span className="rounded-md border border-neon-magenta/30 bg-void-deep/70 px-3 py-1.5 text-neon-magenta/90 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
          Fallos {String(misses).padStart(2, "0")}
        </span>
        <span className="rounded-md border border-neon-yellow/30 bg-void-deep/70 px-3 py-1.5 text-neon-yellow/90 shadow-[inset_0_0_12px_rgba(0,0,0,0.6)]">
          Racha x{streak}
        </span>
      </div>

      <div className="relative z-10 flex w-full min-w-[340px] max-w-sm flex-col items-center gap-8 rounded-2xl border border-neon-cyan/20 bg-void-deep/90 p-8 shadow-[0_24px_70px_-12px_rgba(0,0,0,0.95),0_0_44px_-10px_rgba(56,224,255,0.1),inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-md transition-all duration-500">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-neon-cyan/15 border-t-neon-cyan" />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-neon-cyan/50">
              Cargando<span className="animate-pulse">_</span>
            </p>
          </div>
        ) : (
          <>
            {pokemon?.sprites.other["official-artwork"].front_default && (
              <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-neon-magenta/20 bg-void-abyss p-6 shadow-[inset_0_0_50px_rgba(0,0,0,0.95),0_0_22px_-8px_rgba(214,92,214,0.2)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,transparent_40%,rgba(0,0,0,0.9)_100%)]" />
                <img
                  src={pokemon.sprites.other["official-artwork"].front_default}
                  alt="Misterioso"
                  className={`h-40 w-40 object-contain transition-all duration-700 ease-out ${
                    selectedAnswer
                      ? "scale-105 opacity-100 brightness-100 filter-none animate-float"
                      : "scale-100 opacity-80 filter-[brightness(0)_drop-shadow(0_0_10px_var(--color-neon-cyan))_drop-shadow(0_0_22px_var(--color-neon-magenta))]"
                  }`}
                />
              </div>
            )}

            {selectedAnswer && (
              <p
                className={`animate-fade-in font-display text-[10px] uppercase leading-relaxed tracking-wider ${
                  isCorrect
                    ? "text-neon-green [text-shadow:0_0_10px_var(--color-neon-green)]"
                    : "text-neon-magenta [text-shadow:0_0_10px_var(--color-neon-magenta)]"
                }`}
              >
                {isCorrect ? "¡Correcto!" : `Era: ${pokemon?.name}`}
              </p>
            )}

            <div className="flex w-full flex-col gap-3">
              {options.map((name, index) => {
                const isCurrentSelection = selectedAnswer === name;
                const isCorrectAnswer = pokemon?.name === name;
                let buttonStyles =
                  "border-neon-cyan/25 bg-void-abyss/60 text-neon-cyan/90 hover:border-neon-cyan/60 hover:bg-neon-cyan/10 hover:text-neon-cyan hover:shadow-[0_0_18px_-2px_rgba(56,224,255,0.45)] hover:[text-shadow:0_0_8px_var(--color-neon-cyan)]";
                if (selectedAnswer) {
                  if (isCorrectAnswer) {
                    buttonStyles =
                      "border-neon-green/70 bg-neon-green/12 text-neon-green shadow-[0_0_22px_-4px_rgba(90,240,150,0.45)] [text-shadow:0_0_8px_var(--color-neon-green)]";
                  } else if (isCurrentSelection && !isCorrectAnswer) {
                    buttonStyles =
                      "border-neon-magenta/60 bg-neon-magenta/10 text-neon-magenta/75 line-through";
                  } else {
                    buttonStyles =
                      "border-white/5 bg-transparent text-white/20 cursor-not-allowed";
                  }
                }

                return (
                  <button
                    key={index}
                    disabled={!!selectedAnswer}
                    onClick={() => handleAnswerClick(name)}
                    className={`w-full rounded-lg border px-6 py-3.5 text-center font-mono text-sm capitalize tracking-wide transition-all duration-200 ${
                      !selectedAnswer && "cursor-pointer active:scale-[0.97]"
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
        className="relative z-10 cursor-pointer rounded-lg border border-neon-yellow/60 bg-void-deep/80 px-8 py-3.5 font-display text-[10px] uppercase tracking-widest text-neon-yellow shadow-[0_0_16px_-4px_rgba(240,220,90,0.3),inset_0_0_14px_rgba(0,0,0,0.5)] transition-all duration-200 hover:border-neon-yellow hover:bg-neon-yellow/10 hover:shadow-[0_0_26px_-3px_rgba(240,220,90,0.55)] active:scale-95"
      >
        ▶ Siguiente
      </button>
    </div>
  );
}
