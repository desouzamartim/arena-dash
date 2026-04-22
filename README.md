# ArenaDash

Dashboard em tempo real para acompanhar jogos da NBA, com placares ao vivo, agenda, transmissões no Brasil, filtros avançados e probabilidade de vitória baseada em odds quando disponível.

## O que o projeto faz

- Exibe uma barra superior com jogos ao vivo.
- Mostra jogos em destaque do dia.
- Atualiza os dados dos jogos ao vivo automaticamente a cada 90 segundos.
- Permite buscar jogos por time, data e tipo de transmissão.
- Exibe transmissões brasileiras quando disponíveis.
- Usa `NBA League Pass` como fallback quando não há transmissão brasileira mapeada.
- Mostra probabilidade de vitória nos jogos em destaque usando odds, com fallback quando não houver chave configurada.
- Mantém skeletons de carregamento para suavizar atualizações e filtros.
- Reserva áreas laterais e intermediárias para anúncios.

## Stack

- Next.js com App Router
- React
- TypeScript
- CSS global sem biblioteca visual externa
- API Routes do Next.js para buscar jogos e agenda

## Fontes de dados

O ArenaDash combina dados públicos da NBA com uma base local de transmissões brasileiras:

- Jogos de hoje e placares ao vivo:
  `https://cdn.nba.com/static/json/liveData/scoreboard/todaysScoreboard_00.json`

- Canais/transmissões da NBA:
  `https://cdn.nba.com/static/json/liveData/channels/v2/channels_00.json`

- Agenda da temporada:
  `https://cdn.nba.com/static/json/staticData/scheduleLeagueV2_1.json`

- Probabilidade por odds:
  The Odds API, quando `ODDS_API_KEY` estiver configurada.

Observação: os endpoints da CDN da NBA são públicos, mas não são uma API oficial com contrato de estabilidade. Em produção, vale monitorar mudanças no formato dos dados.

## Transmissões no Brasil

A lógica de transmissão segue esta ordem:

1. Dados da CDN de canais da NBA.
2. Regras locais em `src/data/broadcasts-br.ts`.
3. Fallback para `NBA League Pass`.

No filtro avançado, a opção `BR` retorna jogos com transmissões brasileiras mapeadas, ou seja, tudo que não for apenas `NBA League Pass`.

## Variáveis de ambiente

Crie um arquivo `.env.local` a partir do exemplo:

```bash
cp .env.example .env.local
```

Depois configure:

```env
ODDS_API_KEY=sua_chave_da_the_odds_api
```

A chave é opcional. Sem ela, o projeto continua funcionando e usa uma estimativa simples como fallback para a probabilidade de vitória.

## Rodando localmente

Instale as dependências:

```bash
npm install
```

Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Acesse:

```text
http://localhost:3000
```

Caso a porta 3000 esteja ocupada, o Next.js pode sugerir outra porta automaticamente.

## Scripts

```bash
npm run dev
```

Inicia o ambiente de desenvolvimento.

```bash
npm run build
```

Gera a build de produção.

```bash
npm run start
```

Executa a build de produção localmente.

```bash
npm run lint
```

Roda a validação com ESLint.

## Estrutura principal

```text
src/app/page.tsx
```

Monta a página inicial com jogos em destaque, filtro avançado e áreas de anúncios.

```text
src/components/live-games-dashboard.tsx
```

Controla a experiência ao vivo: ticker, navegação esportiva, atualização automática e cards principais.

```text
src/components/advanced-games-filter.tsx
```

Filtro avançado por time, data e transmissão.

```text
src/lib/nba-api.ts
```

Camada de integração com dados da NBA, normalização de jogos, busca na agenda e cruzamento com transmissões.

```text
src/lib/odds-api.ts
```

Integração com odds e cálculo de probabilidade de vitória.

```text
src/data/broadcasts-br.ts
```

Base local para transmissões brasileiras.

## Deploy

O projeto pode ser publicado na Vercel sem configuração especial.

Para habilitar odds em produção, adicione a variável:

```env
ODDS_API_KEY
```

nas configurações do projeto na plataforma de deploy.

## Roadmap possível

- Criar páginas reais para NFL, NHL e MLB.
- Melhorar a base de transmissões brasileiras com curadoria por rodada.
- Adicionar detalhes de jogo com estatísticas por período.
- Criar página de time com calendário, forma recente e próximos jogos.
- Implementar autenticação para painel administrativo de transmissões e anúncios.
