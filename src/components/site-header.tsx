"use client";

import { getBroadcastLabel } from "@/lib/nba-game-format";
import { leagues } from "@/lib/leagues";
import { getTeamLogo, NbaGame } from "@/lib/nba-api";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
              {game.broadcastsBrazil.length > 0 ? <em>{getBroadcastLabel(game.broadcastsBrazil)}</em> : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SportNav() {
  const pathname = usePathname();

  return (
    <nav className="sportNav" aria-label="Navegacao de esportes">
      <div className="sportNavInner">
        <strong>ArenaDash</strong>
        <div>
          <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
            INICIO
          </Link>
          {leagues.map((league) => {
            const leaguePath = `/${league.slug}`;
            const isCurrent =
              pathname === leaguePath || pathname.startsWith(`/${league.slug}-`);

            return (
              <Link
                href={leaguePath}
                aria-current={isCurrent ? "page" : undefined}
                key={league.slug}
              >
                {league.name}
              </Link>
            );
          })}
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
