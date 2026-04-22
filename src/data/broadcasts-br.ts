export type BroadcastRule = {
  date: string;
  time?: string;
  awayTeam: string;
  homeTeam: string;
  channels: string[];
  source: "manual" | "agenda-br";
};

export const broadcastsBrazilByGameId: Record<string, string[]> = {
  "0052500201": ["Prime Video"],
  "0052500211": ["Prime Video"],
  "0042500172": ["Prime Video"],
  "0042500112": ["Prime Video"],
  "0042500152": ["Prime Video"]
};

export const broadcastsBrazilRules: BroadcastRule[] = [
  {
    date: "2026-04-14",
    time: "20:30",
    awayTeam: "MIA",
    homeTeam: "CHA",
    channels: ["Prime Video"],
    source: "agenda-br"
  },
  {
    date: "2026-04-14",
    time: "23:00",
    awayTeam: "POR",
    homeTeam: "PHX",
    channels: ["Prime Video"],
    source: "agenda-br"
  },
  {
    date: "2026-04-15",
    time: "20:30",
    awayTeam: "ORL",
    homeTeam: "PHI",
    channels: ["Prime Video"],
    source: "agenda-br"
  },
  {
    date: "2026-04-15",
    time: "23:00",
    awayTeam: "GSW",
    homeTeam: "LAC",
    channels: ["Prime Video"],
    source: "agenda-br"
  },
  {
    date: "2026-04-17",
    time: "20:30",
    awayTeam: "CHA",
    homeTeam: "ORL",
    channels: ["Prime Video"],
    source: "manual"
  },
  {
    date: "2026-04-17",
    time: "23:00",
    awayTeam: "GSW",
    homeTeam: "PHX",
    channels: ["Prime Video"],
    source: "manual"
  }
];

function normalizeChannels(channels: string[]) {
  const uniqueChannels = Array.from(new Set(channels.filter(Boolean)));
  const specificChannels = uniqueChannels.filter(
    (channel) => channel !== "NBA League Pass"
  );

  return specificChannels.length > 0 ? specificChannels : uniqueChannels;
}

export function getBroadcastsBrazil({
  gameId,
  date,
  time,
  awayTeam,
  homeTeam,
  channels = []
}: {
  gameId: string;
  date?: string;
  time?: string;
  awayTeam: string;
  homeTeam: string;
  channels?: string[];
}) {
  const rule = broadcastsBrazilRules.find(
    (item) =>
      item.date === date &&
      (!item.time || !time || item.time === time) &&
      item.awayTeam === awayTeam &&
      item.homeTeam === homeTeam
  );

  const resolvedChannels = normalizeChannels([
    ...channels,
    ...(broadcastsBrazilByGameId[gameId] ?? []),
    ...(rule?.channels ?? [])
  ]);

  return resolvedChannels.length > 0 ? resolvedChannels : ["NBA League Pass"];
}
