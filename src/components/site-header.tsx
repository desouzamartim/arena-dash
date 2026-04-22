"use client";

import { getTeamLogo, NbaGame } from "@/lib/nba-api";
import Image from "next/image";

function Ticker({ games }: { games: NbaGame[] }) {
  const liveGames = games.filter((game) => game.status === "live");
  const tickerGames = liveGames.length > 0 ? liveGames : games;
  const items = tickerGames.length > 0 ? [...tickerGames, ...tickerGames] : [];

  return (
    <section className="liveTicker" aria-label="Jogos acontecendo agora">
      <div className="tickerLabel">
        <span className={liveGames.length > 0 ? "liveDot isLive" : "liveDot"} />
        <strong>{liveGames.length > 0 ? "Ao vivo" : "Sem jogos ao vivo agora"}</strong>
      </div>
      <div className="tickerTrackWrap">
        <div className="tickerTrack">
          {items.map((game, index) => (
            <div className="tickerItem" key={`${game.id}-${index}`}>
              <Image src={getTeamLogo(game.awayTeam.id)} alt="" width={26} height={26} />
              <span>{game.awayTeam.abbreviation}</span>
              <strong>
                {game.status === "scheduled"
                  ? game.timeBr
                  : `${game.awayTeam.score}-${game.homeTeam.score}`}
              </strong>
              <span>{game.homeTeam.abbreviation}</span>
              <Image src={getTeamLogo(game.homeTeam.id)} alt="" width={26} height={26} />
              {game.broadcastsBrazil.length > 0 ? (
                <em>{game.broadcastsBrazil.join(" + ")}</em>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SportNav() {
  return (
    <nav className="sportNav" aria-label="Navegacao de esportes">
      <div className="sportNavInner">
        <strong>ArenaDash</strong>
        <div>
          <a aria-disabled="true">NBA</a>
          <a aria-disabled="true">NFL</a>
          <a aria-disabled="true">NHL</a>
          <a aria-disabled="true">MLB</a>
        </div>
      </div>
    </nav>
  );
}

export function SiteHeader({ games }: { games: NbaGame[] }) {
  return (
    <>
      <Ticker games={games} />
      <SportNav />
    </>
  );
}
