"use client";

import React from "react";

interface InstantStepShellProps {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}

export function InstantStepShell({
  eyebrow,
  title,
  description,
  children,
  aside,
}: InstantStepShellProps) {
  return (
    <section className="mx-auto grid w-full max-w-[1040px] gap-6 pb-12 pt-8 sm:pb-14 sm:pt-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:pb-16 lg:pt-12 xl:pt-[52px]">
      <div>
        <div className="mb-8 sm:mb-10">
          <p className="mb-3 text-[13px] font-semibold uppercase tracking-[0.12em] text-[#8C8C8C]">
            {eyebrow}
          </p>
          <h1 className="max-w-[720px] text-[28px] font-bold leading-[1.08] tracking-normal text-white sm:text-[32px] lg:text-[34px]">
            {title}
          </h1>
          <p className="mt-3 max-w-[720px] text-[17px] font-normal leading-snug text-[#A0A0A0] sm:mt-[15px] sm:text-[20px] lg:text-[21px]">
            {description}
          </p>
        </div>

        {children}
      </div>

      {aside ? <aside className="lg:pt-[104px]">{aside}</aside> : null}
    </section>
  );
}
