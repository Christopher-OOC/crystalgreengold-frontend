import React from "react";
import {
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from "recharts";
import { Card } from "@/shared/ui/Card";

const data = [
	{ name: "Feb", pv: 400, uv: 240 },
	{ name: "Mar", pv: 300, uv: 139 },
	{ name: "Apr", pv: 200, uv: 980 },
	{ name: "May", pv: 278, uv: 390 },
	{ name: "Jun", pv: 189, uv: 480 },
	{ name: "Jul", pv: 239, uv: 380 },
	{ name: "Aug", pv: 349, uv: 430 },
	{ name: "Sep", pv: 430, uv: 550 },
	{ name: "Oct", pv: 380, uv: 490 },
	{ name: "Nov", pv: 520, uv: 610 },
	{ name: "Dec", pv: 600, uv: 700 },
];

export const MainChart = () => {
	return (
		<Card className="h-[280px] p-4">
			<div className="flex justify-between items-center mb-3">
				<div>
					<h3 className="text-base font-bold text-emerald-950 dark:text-white">
						Revenue Analysis
					</h3>
					<p className="text-emerald-600 text-[10px]">
						Monthly performance overview
					</p>
				</div>
				<div className="flex space-x-1">
					{["2023", "2024", "2025"].map((year) => (
						<button
							key={year}
							className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
								year === "2025"
									? "bg-amber-400 text-white"
									: "text-emerald-400 dark:text-emerald-600 hover:text-emerald-950 dark:hover:text-emerald-200"
							}`}
						>
							{year}
						</button>
					))}
				</div>
			</div>

			<div className="h-[190px] w-full">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={data}>
						<defs>
							<linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
							</linearGradient>
							<linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
								<stop offset="95%" stopColor="#10b981" stopOpacity={0} />
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray="3 3"
							stroke="currentColor"
							className="text-black/5 dark:text-white/5"
							vertical={false}
						/>
						<XAxis
							dataKey="name"
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#64748b", fontSize: 12 }}
							dy={10}
						/>
						<YAxis
							axisLine={false}
							tickLine={false}
							tick={{ fill: "#64748b", fontSize: 12 }}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: "rgba(255, 255, 255, 0.9)",
								border: "1px solid #e2e8f0",
								borderRadius: "12px",
								color: "#0f172a",
							}}
							itemStyle={{ color: "#0f172a" }}
						/>
						<Area
							type="monotone"
							dataKey="pv"
							stroke="#f59e0b"
							strokeWidth={3}
							fillOpacity={1}
							fill="url(#colorPv)"
						/>
						<Area
							type="monotone"
							dataKey="uv"
							stroke="#10b981"
							strokeWidth={3}
							fillOpacity={1}
							fill="url(#colorUv)"
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</Card>
	);
};
