"use client";

import { bestFishingWindows, nowHourIndex } from "@/lib/engines/explain";
import { formatChartTick, formatTime, formatWeekdayHour } from "@/lib/format";
import type { HourlyPoint } from "@/lib/types";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function fishingDot(props: {
  key?: string;
  index?: number;
  cx?: number;
  cy?: number;
  payload?: { isNow?: boolean; isPeak?: boolean };
}) {
  const key = props.key ?? `dot-${props.index ?? 0}`;
  const { cx, cy, payload } = props;
  if (cx == null || cy == null) return <g key={key} />;
  if (payload?.isNow) {
    return (
      <g key={key}>
        <circle cx={cx} cy={cy} r={8} fill="rgba(232,238,244,0.18)" />
        <circle cx={cx} cy={cy} r={5} fill="#e8eef4" stroke="#2ec4b6" strokeWidth={2} />
      </g>
    );
  }
  if (payload?.isPeak) {
    return (
      <g key={key}>
        <circle cx={cx} cy={cy} r={4.5} fill="#d4a853" stroke="#0b1117" strokeWidth={1.5} />
      </g>
    );
  }
  return <g key={key} />;
}

export function TrendChart({
  points,
  metric = "ifScore",
}: {
  points: HourlyPoint[];
  metric?: "ifScore" | "airTempC" | "waterTempC" | "pressureHpa" | "windKmh" | "cloudPct";
}) {
  const fishing = metric === "ifScore";
  const nowIdx = nowHourIndex(points);
  const windows = fishing ? bestFishingWindows(points) : [];
  const peakIdx = new Set(windows.map((w) => w.peakIdx));

  const data = points.map((p, i) => ({
    i,
    ...p,
    label: formatChartTick(p.time),
    isNow: i === nowIdx,
    isPeak: peakIdx.has(i),
  }));

  const color =
    metric === "ifScore" ? "#2ec4b6" : metric === "pressureHpa" ? "#d4a853" : "#8b9bb0";

  return (
    <div>
      <div className={fishing ? "h-64 w-full" : "h-56 w-full"}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 22, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" />
            <XAxis
              dataKey="i"
              type="number"
              domain={[0, Math.max(0, data.length - 1)]}
              ticks={data.map((_, i) => i).filter((i) => i % 6 === 0)}
              tickFormatter={(i) => data[i]?.label ?? ""}
              stroke="#8b9bb0"
              tick={{ fontSize: 11 }}
            />
            <YAxis
              stroke="#8b9bb0"
              tick={{ fontSize: 11 }}
              width={36}
              domain={["auto", "auto"]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.[0]) return null;
                const p = payload[0].payload as (typeof data)[number];
                return (
                  <div className="rounded-lg border border-white/10 bg-ink-800 px-3 py-2 text-xs">
                    <p className="text-mist-300">{formatWeekdayHour(p.time)}</p>
                    <p className="font-mono text-sm text-mist-100">
                      {metric === "ifScore" ? "IF" : metric} {p[metric] ?? "—"}
                    </p>
                    {p.isNow && <p className="mt-1 font-semibold text-mist-100">Maintenant</p>}
                    {p.isPeak && <p className="mt-1 font-semibold text-gold">Meilleure heure</p>}
                  </div>
                );
              }}
            />
            {windows.map((w) => (
              <ReferenceArea
                key={`${w.from}-${w.to}`}
                x1={w.startIdx === w.endIdx ? w.startIdx - 0.45 : w.startIdx}
                x2={w.startIdx === w.endIdx ? w.endIdx + 0.45 : w.endIdx}
                fill="#d4a853"
                fillOpacity={0.16}
                ifOverflow="extendDomain"
              />
            ))}
            {fishing && (
              <ReferenceLine
                x={nowIdx}
                stroke="#e8eef4"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: "Maintenant",
                  position: nowIdx < 8 ? "insideTopLeft" : "top",
                  fill: "#e8eef4",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey={metric}
              stroke={color}
              strokeWidth={2}
              dot={fishing ? fishingDot : false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {fishing && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-mist-100">
            <span className="h-2.5 w-2.5 rounded-full bg-mist-100 ring-2 ring-teal" />
            Maintenant · {formatTime(points[nowIdx]?.time)}
          </span>
          {windows.length === 0 && (
            <span className="text-mist-500">Pas de pic nettement plus favorable sur 72 h.</span>
          )}
          {windows.map((w) => (
            <span
              key={w.peakTime}
              className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-2.5 py-1 text-gold"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-gold" />
              {formatTime(w.from)}
              {w.from !== w.to ? `–${formatTime(w.to)}` : ""} · pic {w.peak}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
