"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { HelpCircle } from "lucide-react";

export default function MainboardLoginPage() {
  const router = useRouter();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push("/dashboard/booking");
  };

  return (
    <main className="min-h-screen bg-white text-[#7a7a7a]">
      <div className="mx-auto flex min-h-screen max-w-[920px] flex-col px-4">
        <nav className="flex justify-center gap-8 pt-14 text-[14px] font-semibold uppercase tracking-[0.02em] text-[#8d8d8d] sm:gap-14">
          <span className="border-b border-[#3f7daa] pb-1 text-[#3f7daa]">Portfoliopad Login</span>
          <span>Talent Login</span>
          <span>Castingpad Login</span>
        </nav>

        <section className="flex flex-1 flex-col items-center justify-center pb-16 pt-10">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-[540px] rounded-[26px] border border-[#eef0f5] bg-[#fbfbfd] px-8 pb-8 pt-9 shadow-[0_10px_38px_rgba(25,44,80,0.08)] sm:px-14"
          >
            <h1 className="text-center text-[44px] font-semibold leading-none text-[#2f7fca] sm:text-[54px]">
              Portfoliopad
            </h1>

            <div className="mx-auto mt-9 max-w-[360px] space-y-4">
              <label className="block">
                <span className="sr-only">Email</span>
                <input
                  defaultValue="brad@mainboard.com"
                  className="h-10 w-full rounded-[7px] border border-[#c4cedd] bg-[#eaf2ff] px-4 text-[14px] font-semibold text-[#555] outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] focus:border-[#5d93cf]"
                />
              </label>
              <label className="block">
                <span className="sr-only">Password</span>
                <input
                  type="password"
                  defaultValue="mainboard"
                  className="h-10 w-full rounded-[7px] border border-[#c4cedd] bg-[#eaf2ff] px-4 text-[14px] font-semibold text-[#555] outline-none shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)] focus:border-[#5d93cf]"
                />
              </label>

              <div className="flex flex-col items-center gap-3 pt-1">
                <button
                  type="submit"
                  className="h-12 min-w-[144px] rounded-[8px] bg-[#287dc4] px-8 text-[22px] font-semibold uppercase leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_4px_rgba(39,125,196,0.28)] transition-colors hover:bg-[#1f70b6]"
                >
                  Login
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#9d9d9d] hover:text-[#6f6f6f]"
                >
                  Forgot Password
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          <button
            type="button"
            className="mt-8 h-11 rounded-[8px] border-2 border-[#bfc1c5] bg-white px-6 text-[15px] font-bold uppercase text-[#9a9a9a] transition-colors hover:border-[#8f949d] hover:text-[#6f6f6f]"
          >
            Get Support
          </button>
        </section>

        <footer className="border-t border-[#d9d9d9] py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-black">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-black text-[18px] font-black leading-none">
              m
            </span>
            <span className="text-[25px] font-black tracking-[-0.04em]">mainboard</span>
          </div>
          <p className="mx-auto mt-3 max-w-[620px] text-[12px] font-semibold leading-5 text-[#a1a1a1]">
            As the trusted market leader, we set the standard for innovative business solutions for talent,
            fashion, advertising and media industries across the globe.
          </p>
        </footer>
      </div>
    </main>
  );
}
