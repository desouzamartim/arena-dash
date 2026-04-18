export const broadcastsBrazilByGameId: Record<string, string[]> = {
  "0052500201": ["Prime Video"],
  "0052500211": ["Prime Video"]
};

export const broadcastsBrazilByMatchup: Record<string, string[]> = {
  "CHA-ORL": ["Prime Video"],
  "GSW-PHX": ["Prime Video"]
};

export function getBroadcastsBrazil(gameId: string, awayTeam: string, homeTeam: string) {
  return (
    broadcastsBrazilByGameId[gameId] ??
    broadcastsBrazilByMatchup[`${awayTeam}-${homeTeam}`] ??
    []
  );
}
