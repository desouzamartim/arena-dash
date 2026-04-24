export type LeagueDefinition = {
  slug: string;
  name: string;
  description: string;
  status: string;
  isAvailable: boolean;
};

export const leagues: LeagueDefinition[] = [
  {
    slug: "nba",
    name: "NBA",
    description: "Jogos ao vivo, agenda, transmissoes, estatisticas e highlights.",
    status: "Disponivel",
    isAvailable: true
  },
  {
    slug: "nfl",
    name: "NFL",
    description: "Placar, calendario e transmissoes em breve.",
    status: "Em breve",
    isAvailable: false
  },
  {
    slug: "nhl",
    name: "NHL",
    description: "Cobertura de partidas e filtros em construcao.",
    status: "Em breve",
    isAvailable: false
  },
  {
    slug: "mlb",
    name: "MLB",
    description: "Acompanhamento de jogos planejado para uma proxima etapa.",
    status: "Em breve",
    isAvailable: false
  }
];

export function getLeagueBySlug(slug: string) {
  return leagues.find((league) => league.slug === slug);
}
