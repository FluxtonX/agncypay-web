"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Menu, Settings } from "lucide-react";
import { cn } from "../../../lib/utils";

const birthdays = [
  { name: "Adrianne Ho", age: 38, date: "05 May", color: "from-[#f1c1ad] to-[#6c8fb0]" },
  { name: "Lucy Calway", age: 11, date: "05 May", color: "from-[#dedede] to-[#7c7c7c]" },
  { name: "Lynne Mack", age: 11, date: "05 May", color: "from-[#2bb0d8] to-[#f55d77]" },
  { name: "Zenelda Casova", age: 33, date: "05 May", color: "from-[#d2b797] to-[#604b3b]" },
  { name: "Hudson A", age: 11, date: "07 May", color: "from-[#f5ddbd] to-[#bc9b79]" },
  { name: "Jeanine Ruff", age: 42, date: "07 May", color: "from-[#dadada] to-[#868686]" },
  { name: "Malia Kent", age: 19, date: "07 May", color: "from-[#b8ddff] to-[#437bb8]" },
  { name: "Rafi Daniels", age: 27, date: "08 May", color: "from-[#d6ffbd] to-[#588a48]" },
  { name: "Priya Sato", age: 31, date: "08 May", color: "from-[#ffd7e7] to-[#9a5d78]" },
  { name: "Mateo James", age: 22, date: "09 May", color: "from-[#c9c4ff] to-[#5c57a5]" },
  { name: "Isla Moore", age: 26, date: "09 May", color: "from-[#fff0b8] to-[#c59a2f]" },
  { name: "Noah Avery", age: 35, date: "10 May", color: "from-[#c7f4ee] to-[#477d76]" },
];

const permits = [
  { talent: "Mila Stone", country: "United Kingdom", expiry: "June 18, 2026", status: "Review" },
  { talent: "Arden Cho", country: "Canada", expiry: "July 03, 2026", status: "Ready" },
];

const castings = [
  { project: "Spring Editorial", client: "North Studio", due: "Today", unread: 3 },
  { project: "Footwear Campaign", client: "Nike, Inc.", due: "Tomorrow", unread: 1 },
  { project: "Resort Lookbook", client: "Atlas Talent Group", due: "June 05", unread: 2 },
];

function TopNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dddddd] bg-[#f4f4f4]/95 px-3 py-3 backdrop-blur">
      <div className="flex flex-nowrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto">
          <Link
            href="/dashboard/booking"
            className="inline-flex h-9 shrink-0 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#3971b6] shadow-sm"
          >
            Booking Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 shrink-0 items-center rounded-[4px] border border-white bg-white px-4 text-[12px] font-semibold uppercase text-[#1a1a1a] shadow-sm"
          >
            Finance Dashboard
          </Link>
          <Link
            href="/dashboard/settings"
            className="inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-[4px] border border-white bg-white text-[#3971b6] shadow-sm"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Panel({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-[12px] border border-[#e5e5e5] bg-white p-5 shadow-[0_3px_18px_rgba(0,0,0,0.08)]", className)}>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[16px] font-bold text-[#5c5c5c]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function BirthdayAvatar({ color, name }: { color: string; name: string }) {
  return (
    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[13px] font-black text-white shadow-sm", color)}>
      {name.split(" ").map((part) => part[0]).join("").slice(0, 2)}
    </div>
  );
}

function BirthdaysPanel() {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil(birthdays.length / pageSize);
  const visible = useMemo(() => birthdays.slice((page - 1) * pageSize, page * pageSize), [page]);
  const grouped = visible.reduce<Record<string, typeof birthdays>>((groups, person) => {
    groups[person.date] = [...(groups[person.date] || []), person];
    return groups;
  }, {});

  return (
    <Panel title="Upcoming birthdays" className="min-h-[455px]">
      <div className="mt-4 max-h-[318px] overflow-y-auto pr-2">
        {Object.entries(grouped).map(([date, people]) => (
          <div key={date}>
            <div className="border-y border-[#eeeeee] bg-[#fafafa] px-2 py-1 text-[12px] font-semibold text-[#b2b2b2]">{date}</div>
            <div className="space-y-3 py-3">
              {people.map((person) => (
                <button key={person.name} type="button" className="flex w-full items-center gap-3 rounded-[8px] px-2 py-1 text-left hover:bg-[#f6f8fb]">
                  <BirthdayAvatar color={person.color} name={person.name} />
                  <span className="min-w-0">
                    <span className="block truncate text-[14px] font-bold text-[#4f8bc2]">{person.name}</span>
                    <span className="block text-[12px] font-semibold text-[#a0a0a0]">Turning {person.age} years old</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 border-y border-[#e6e6e6] bg-[#f5f5f5] px-2 py-2 text-[12px] font-bold text-[#9a9a9a]">({birthdays.length} Items)</div>
      <div className="mt-3 flex items-center justify-between border-t border-[#e6e6e6] pt-3 text-[12px] font-bold uppercase text-[#9a9a9a]">
        <span>Page {page} of {totalPages}</span>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage(1)} className="rounded p-1 hover:bg-[#eeeeee]" aria-label="First page"><ChevronsLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded p-1 hover:bg-[#eeeeee]" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
          <button type="button" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded p-1 hover:bg-[#eeeeee]" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
          <button type="button" onClick={() => setPage(totalPages)} className="rounded p-1 hover:bg-[#eeeeee]" aria-label="Last page"><ChevronsRight className="h-4 w-4" /></button>
        </div>
        <span>Page size: {pageSize}</span>
      </div>
    </Panel>
  );
}

function PermitsPanel() {
  return (
    <Panel title="Work permits expiring in the next 60 days" className="min-h-[455px]">
      <div className="mt-5 rounded-[8px] border border-[#eeeeee]">
        {permits.length ? (
          permits.map((permit) => (
            <div key={permit.talent} className="grid grid-cols-[1fr_120px_92px] gap-3 border-b border-[#eeeeee] px-3 py-3 last:border-b-0">
              <div>
                <p className="text-[13px] font-bold text-[#5c5c5c]">{permit.talent}</p>
                <p className="mt-1 text-[12px] font-semibold text-[#a0a0a0]">{permit.country}</p>
              </div>
              <p className="text-[12px] font-semibold text-[#777]">{permit.expiry}</p>
              <span className={cn("inline-flex h-7 items-center justify-center rounded-[6px] text-[12px] font-bold", permit.status === "Ready" ? "bg-[#e9f8ef] text-[#19944a]" : "bg-[#fff5df] text-[#a96b00]")}>{permit.status}</span>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-[13px] font-semibold text-[#b0b0b0]">No work permits expiring within the next 60 days</p>
        )}
      </div>
      <div className="mt-[190px] bg-[#f5f5f5] px-3 py-3 text-[12px] font-bold text-[#9a9a9a]">({permits.length} Items)</div>
    </Panel>
  );
}

function OpenedGauge() {
  return (
    <Panel title="My opened % in the last 30 days" className="min-h-[340px]">
      <div className="mt-4 flex justify-end">
        <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#e2e2e2] bg-white text-[#777] hover:bg-[#f5f5f5]" aria-label="Chart options">
          <Menu className="h-5 w-5" />
        </button>
      </div>
      <div className="flex flex-col items-center">
        <div className="relative mt-2 h-[160px] w-[280px] overflow-hidden">
          <div className="absolute left-1/2 top-8 h-[240px] w-[240px] -translate-x-1/2 rounded-full border-[18px] border-[#eeeeee]" />
          <div className="absolute left-1/2 top-8 h-[240px] w-[240px] -translate-x-1/2 rounded-full border-[18px] border-transparent border-l-[#ffd51e] border-t-[#ffd51e] rotate-[-40deg]" />
          <div className="absolute left-1/2 top-8 h-[240px] w-[240px] -translate-x-1/2 rounded-full border-[18px] border-transparent border-r-[#24922e] border-t-[#24922e] rotate-[34deg]" />
          <div className="absolute bottom-0 left-1/2 h-[74px] w-[74px] -translate-x-1/2 rounded-full bg-white text-center">
            <p className="pt-5 text-[25px] font-black text-[#5e5e5e]">58%</p>
          </div>
          <span className="absolute left-[54px] top-[72px] text-[12px] font-bold text-[#9d9d9d]">30%</span>
          <span className="absolute left-[126px] top-[38px] text-[12px] font-bold text-[#9d9d9d]">50%</span>
          <span className="absolute right-[55px] top-[72px] text-[12px] font-bold text-[#9d9d9d]">70%</span>
        </div>
        <p className="mt-2 text-[13px] font-semibold text-[#9a9a9a]">Opened bookings are trending above the agency average.</p>
      </div>
    </Panel>
  );
}

function CastingsPanel() {
  return (
    <Panel title="Unreplied castings received in the last 15 days" className="min-h-[340px]">
      <div className="mt-5 space-y-3">
        {castings.map((casting) => (
          <button key={casting.project} type="button" className="grid w-full grid-cols-[1fr_92px_56px] items-center gap-3 rounded-[8px] border border-[#eeeeee] px-3 py-3 text-left hover:bg-[#f8f8f8]">
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-bold text-[#5c5c5c]">{casting.project}</span>
              <span className="mt-1 block truncate text-[12px] font-semibold text-[#a0a0a0]">{casting.client}</span>
            </span>
            <span className="text-[12px] font-bold text-[#8b8b8b]">{casting.due}</span>
            <span className="inline-flex h-7 items-center justify-center rounded-full bg-[#eef5ff] text-[12px] font-black text-[#3971b6]">{casting.unread}</span>
          </button>
        ))}
      </div>
      <div className="mt-5 bg-[#f5f5f5] px-3 py-3 text-[12px] font-bold text-[#9a9a9a]">({castings.length} Items)</div>
    </Panel>
  );
}

export default function BookingDashboardPage() {
  return (
    <main className="min-h-screen bg-[#f3f3f3] text-[#5c5c5c]">
      <TopNav />
      <div className="mx-auto max-w-[1380px] px-3 py-5 sm:px-5">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-2">
          <BirthdaysPanel />
          <PermitsPanel />
          <OpenedGauge />
          <CastingsPanel />
        </div>
      </div>
    </main>
  );
}
