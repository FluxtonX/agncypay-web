"use client";

import React, { useState } from "react";
import { Download, TrendingUp, TrendingDown, Users, DollarSign, WalletCards } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { cn } from "../../../lib/utils";

// --- DUMMY DATA ---

const monthlyData = [
  { month: "Jan", income: 214000, payouts: 150000 },
  { month: "Feb", income: 286000, payouts: 180000 },
  { month: "Mar", income: 181000, payouts: 140000 },
  { month: "Apr", income: 314000, payouts: 200000 },
  { month: "May", income: 242000, payouts: 160000 },
  { month: "Jun", income: 269000, payouts: 190000 },
  { month: "Jul", income: 337000, payouts: 220000 },
  { month: "Aug", income: 218000, payouts: 150000 },
  { month: "Sep", income: 298000, payouts: 210000 },
  { month: "Oct", income: 361000, payouts: 250000 },
  { month: "Nov", income: 251000, payouts: 180000 },
  { month: "Dec", income: 407000, payouts: 280000 },
];

const sourceData = [
  { name: "Spotify", value: 45000 },
  { name: "Apple Music", value: 35000 },
  { name: "TikTok", value: 25000 },
  { name: "YouTube", value: 15000 },
  { name: "Amazon Music", value: 10000 },
];

const COLORS = ["#13d463", "#2ccfd2", "#fa2d48", "#ff0000", "#ff5500"];

const topTalents = [
  { name: "John Adams", amount: 125000 },
  { name: "Amy Holland", amount: 98000 },
  { name: "Lucy Che", amount: 84000 },
  { name: "Jessica Bailey", amount: 62000 },
  { name: "Lola Durant", amount: 41000 },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function StatCard({
  title,
  value,
  trend,
  trendUp,
  icon: Icon,
}: {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: any;
}) {
  return (
    <div className="flex flex-col justify-between rounded-[13px] border border-[#303030] bg-[#060606] p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-semibold text-[#8d8d8d]">{title}</p>
        <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#111]">
          <Icon className="h-5 w-5 text-[#b8b8b8]" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-[28px] font-black text-white">{value}</p>
        <div className="mt-2 flex items-center gap-2">
          <span
            className={cn(
              "flex items-center text-[13px] font-bold",
              trendUp ? "text-[#13d463]" : "text-[#ff6b5f]"
            )}
          >
            {trendUp ? <TrendingUp className="mr-1 h-4 w-4" /> : <TrendingDown className="mr-1 h-4 w-4" />}
            {trend}
          </span>
          <span className="text-[13px] text-[#676767]">vs last month</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("1Y");

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[34px] font-semibold leading-none text-white">Analytics</h1>
          <p className="mt-[18px] text-[20px] leading-6 text-[#9b9b9b]">
            Detailed financial overview and business insights.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-[8px] border border-[#303030] bg-[#060606] p-1">
            {["1W", "1M", "3M", "1Y", "ALL"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={cn(
                  "rounded-[6px] px-3 py-1.5 text-[13px] font-bold transition-colors",
                  timeRange === range
                    ? "bg-[#222] text-white"
                    : "text-[#8d8d8d] hover:text-white"
                )}
              >
                {range}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="inline-flex h-[36px] items-center justify-center gap-2 rounded-[7px] border border-[#5a5a5a] bg-[#0c0c0c] px-4 text-[14px] font-semibold text-white transition-colors hover:border-[#777]"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Income" value="$3,378,000" trend="+12.5%" trendUp={true} icon={DollarSign} />
        <StatCard title="Total Payouts" value="$2,310,000" trend="+8.2%" trendUp={true} icon={WalletCards} />
        <StatCard title="Active Contacts" value="842" trend="+15" trendUp={true} icon={Users} />
        <StatCard title="Pending Review" value="$42,500" trend="-5.4%" trendUp={false} icon={TrendingDown} />
      </div>

      {/* Main Charts */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cash Flow Area Chart */}
        <div className="rounded-[13px] border border-[#303030] bg-[#060606] p-6 lg:col-span-2">
          <h2 className="text-[18px] font-semibold text-white">Cash Flow Overview</h2>
          <p className="mt-1 text-[13px] text-[#8d8d8d]">Income vs Payouts over the selected period.</p>
          <div className="mt-8 h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#13d463" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#13d463" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPayouts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#555555" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#555555" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="month" stroke="#666" tick={{ fill: "#8d8d8d", fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#666"
                  tick={{ fill: "#8d8d8d", fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value / 1000}k`}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px", color: "#fff" }}
                  itemStyle={{ color: "#fff", fontWeight: 600 }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: "20px" }} />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Total Income"
                  stroke="#13d463"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
                <Area
                  type="monotone"
                  dataKey="payouts"
                  name="Total Payouts"
                  stroke="#777"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPayouts)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Income Sources Donut Chart */}
        <div className="rounded-[13px] border border-[#303030] bg-[#060606] p-6">
          <h2 className="text-[18px] font-semibold text-white">Revenue Sources</h2>
          <p className="mt-1 text-[13px] text-[#8d8d8d]">Distribution by platform.</p>
          <div className="mt-8 flex h-[360px] items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="45%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px", color: "#fff" }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[13px] font-medium text-[#c8c8c8]">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Earners Bar Chart */}
        <div className="rounded-[13px] border border-[#303030] bg-[#060606] p-6">
          <h2 className="text-[18px] font-semibold text-white">Top Earners</h2>
          <p className="mt-1 text-[13px] text-[#8d8d8d]">Highest performing talent this period.</p>
          <div className="mt-8 h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topTalents} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#666" tick={{ fill: "#8d8d8d", fontSize: 12 }} tickFormatter={(value) => `$${value / 1000}k`} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#666" tick={{ fill: "#e8e8e8", fontSize: 13, fontWeight: 500 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: "#111" }}
                  contentStyle={{ backgroundColor: "#000", borderColor: "#333", borderRadius: "8px", color: "#fff" }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
                <Bar dataKey="amount" name="Earnings" fill="#2ccfd2" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Metrics List */}
        <div className="rounded-[13px] border border-[#303030] bg-[#060606] p-6">
          <h2 className="text-[18px] font-semibold text-white">Performance Metrics</h2>
          <p className="mt-1 text-[13px] text-[#8d8d8d]">Key indicators for your business.</p>
          
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-white">Average Payment Delay</p>
                <p className="text-[13px] text-[#8d8d8d]">Time between invoice and payout</p>
              </div>
              <p className="text-[20px] font-black text-white">4.2 Days</p>
            </div>
            
            <div className="h-[1px] w-full bg-[#222]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-white">Autosplit Adoption</p>
                <p className="text-[13px] text-[#8d8d8d]">Percentage of contacts using autosplit</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[20px] font-black text-white">68%</p>
                <span className="flex items-center text-[13px] font-bold text-[#13d463]">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  +12%
                </span>
              </div>
            </div>

            <div className="h-[1px] w-full bg-[#222]" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[15px] font-semibold text-white">Success Rate</p>
                <p className="text-[13px] text-[#8d8d8d]">Completed payments vs failed</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-[20px] font-black text-white">99.8%</p>
                <span className="flex items-center text-[13px] font-bold text-[#13d463]">
                  <TrendingUp className="mr-1 h-4 w-4" />
                  +0.1%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
