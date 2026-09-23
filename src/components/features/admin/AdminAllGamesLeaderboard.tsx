"use client";

import { useEffect, useState } from "react";
import {
  useGetGameLeaderboardQuery,
  useListGamesQuery,
} from "@/context/services/gamesApi";
import { gameLogoUrl } from "@/lib/game-logos";
import { notionistsAvatar } from "@/lib/dicebear";

const LINE = "border border-border";
const CARD = `rounded-2xl bg-card ${LINE} p-5`;

export default function AdminAllGamesLeaderboard() {
  const { data: games = [], isLoading: gamesLoading } = useListGamesQuery();
  const [slug, setSlug] = useState("");

  useEffect(() => {
    if (!games.length) return;
    if (!slug || !games.some((g) => g.slug === slug)) {
      setSlug(games[0].slug);
    }
  }, [games, slug]);

  const { data: lb, isFetching } = useGetGameLeaderboardQuery(
    { slug, limit: 10 },
    { skip: !slug },
  );

  return (
    <section className={CARD}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
            All-games leaderboard
          </h2>
          <p className="mt-1 text-[13px] text-muted-foreground">
            UTC day · {lb?.day ?? "—"} · top players across the catalog
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {games.map((game) => (
            <button
              key={game.slug}
              type="button"
              onClick={() => setSlug(game.slug)}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                slug === game.slug
                  ? "border border-sunrise-coral bg-sunrise-coral text-white shadow-xs"
                  : `border border-border text-muted-foreground hover:border-border/80 hover:text-foreground`
              }`}
            >
              <img
                src={gameLogoUrl(game.slug)}
                alt=""
                width={20}
                height={20}
                className="h-5 w-5 rounded-md"
              />
              {game.name}
            </button>
          ))}
          {gamesLoading ? (
            <p className="text-[13px] text-muted-foreground">Loading games…</p>
          ) : null}
          {!gamesLoading && games.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No games in catalog.</p>
          ) : null}
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        {isFetching && !lb ? (
          <p className="text-[13px] text-muted-foreground">Loading leaderboard…</p>
        ) : (
          <table className="w-full min-w-[480px] text-left text-[13px]">
            <thead className="text-muted-foreground">
              <tr>
                <th className="pb-3 font-medium">Rank</th>
                <th className="pb-3 font-medium">Player</th>
                <th className="pb-3 text-right font-medium">Score</th>
              </tr>
            </thead>
            <tbody>
              {(lb?.entries ?? []).length === 0 ? (
                <tr className="border-t border-border">
                  <td colSpan={3} className="py-4 text-muted-foreground">
                    No scores for this game today.
                  </td>
                </tr>
              ) : (
                lb!.entries.map((row) => {
                  const name = row.displayName || `Player ${row.userId}`;
                  const avatar =
                    row.avatarUrl ||
                    notionistsAvatar(name, 64);
                  return (
                    <tr
                      key={`${row.userId}-${row.rank}`}
                      className="border-t border-border"
                    >
                      <td className="py-3 font-medium">#{row.rank}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={avatar}
                            alt=""
                            width={28}
                            height={28}
                            className="size-7 rounded-[8px] bg-muted object-cover"
                          />
                          <span>{name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right font-semibold">{row.score}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
