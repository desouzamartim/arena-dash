import { redirect } from "next/navigation";

type GamePageProps = {
  params: Promise<{
    gameId: string;
  }>;
};
export default async function GamePage({ params }: GamePageProps) {
  const { gameId } = await params;
  redirect(`/nba-${gameId}`);
}
