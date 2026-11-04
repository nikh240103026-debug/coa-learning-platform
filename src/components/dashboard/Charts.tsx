"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const tick = { fontSize: 11, fill: "rgb(var(--muted))", fontFamily: "var(--font-jetbrains), monospace" };
const tooltipStyle = {
  background: "rgb(var(--surface))",
  border: "1px solid rgb(var(--line))",
  borderRadius: 3,
  fontSize: 12,
  color: "rgb(var(--ink))",
};

export function ScoreChart({ data }: { data: { name: string; score: number }[] }) {
  return (
    <div className="h-56" role="img" aria-label="Bar chart of best test score per chapter">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" vertical={false} />
          <XAxis dataKey="name" tick={tick} tickLine={false} axisLine={{ stroke: "rgb(var(--line))" }} interval={0} />
          <YAxis domain={[0, 100]} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={tooltipStyle}
            cursor={{ fill: "rgb(var(--accent) / 0.08)" }}
            labelFormatter={(label) => `Chapter ${label}`}
          />
          <Bar dataKey="score" name="Best score %" fill="rgb(var(--accent))" radius={[2, 2, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ActivityChart({ data }: { data: { day: string; actions: number }[] }) {
  return (
    <div className="h-56" role="img" aria-label="Line chart of study activity over the last 14 days">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="rgb(var(--line))" vertical={false} />
          <XAxis dataKey="day" tick={tick} tickLine={false} axisLine={{ stroke: "rgb(var(--line))" }} interval={2} />
          <YAxis allowDecimals={false} tick={tick} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="actions" name="Study actions" stroke="rgb(var(--accent))" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
