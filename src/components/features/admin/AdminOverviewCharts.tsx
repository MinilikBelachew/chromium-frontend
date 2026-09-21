"use client";

import * as React from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AdminOverviewResponse } from "@/context/services/adminApi";

const activityConfig = {
  sessions: {
    label: "Watch sessions",
    color: "var(--chart-1)",
  },
  plays: {
    label: "Game plays",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

const weeklyConfig = {
  plays: {
    label: "Plays",
    color: "var(--chart-1)",
  },
  highScore: {
    label: "High score",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

const gamesConfig = {
  plays: {
    label: "Plays",
    color: "var(--chart-1)",
  },
  avgScore: {
    label: "Avg score",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export function AdminActivityAreaChart({
  data,
}: {
  data: AdminOverviewResponse["activity"];
}) {
  const [timeRange, setTimeRange] = React.useState("90d");

  const filteredData = React.useMemo(() => {
    if (!data.length) return [];
    const referenceDate = new Date(data[data.length - 1].date);
    let daysToSubtract = 90;
    if (timeRange === "30d") daysToSubtract = 30;
    else if (timeRange === "7d") daysToSubtract = 7;
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - (daysToSubtract - 1));
    return data.filter((item) => new Date(item.date) >= startDate);
  }, [data, timeRange]);

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b border-border py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Platform activity</CardTitle>
          <CardDescription>
            Watch sessions and mini-game plays over time
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select range"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={activityConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillPlays" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-plays)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-plays)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) =>
                    new Date(String(value)).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="plays"
              type="natural"
              fill="url(#fillPlays)"
              stroke="var(--color-plays)"
              stackId="a"
            />
            <Area
              dataKey="sessions"
              type="natural"
              fill="url(#fillSessions)"
              stroke="var(--color-sessions)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AdminWeeklyBarChart({
  data,
}: {
  data: AdminOverviewResponse["weeklyPlays"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardDescription>Daily plays and high scores</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={weeklyConfig} className="aspect-auto h-[220px] w-full">
          <BarChart accessibilityLayer data={data}>
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { weekday: "short" })
              }
            />
            <Bar
              dataKey="plays"
              stackId="a"
              fill="var(--color-plays)"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="highScore"
              stackId="a"
              fill="var(--color-highScore)"
              radius={[4, 4, 0, 0]}
            />
            <ChartTooltip
              content={<ChartTooltipContent hideIndicator />}
              cursor={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export function AdminGamesBarChart({
  data,
}: {
  data: AdminOverviewResponse["gameStats"];
}) {
  const chartData = data.map((g) => ({
    game: g.name,
    plays: g.plays,
    avgScore: g.avgScore,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Games performance</CardTitle>
        <CardDescription>Plays and average score by catalog game</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={gamesConfig} className="aspect-auto h-[220px] w-full">
          <BarChart accessibilityLayer data={chartData}>
            <XAxis dataKey="game" tickLine={false} tickMargin={10} axisLine={false} />
            <Bar dataKey="plays" fill="var(--color-plays)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="avgScore" fill="var(--color-avgScore)" radius={[4, 4, 0, 0]} />
            <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
            <ChartLegend content={<ChartLegendContent />} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
