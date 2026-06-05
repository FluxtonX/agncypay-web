import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, Download, Search } from "lucide-react";
import { cn } from "../../../../lib/utils";

type PlatformKey =
  | "apple-music"
  | "spotify"
  | "amazon-music"
  | "soundcloud"
  | "youtube"
  | "tiktok"
  | "iheart-radio"
  | "instagram"
  | "pandora"
  | "tidal";

type PaymentRow = {
  payStub: string;
  job: string;
  po: string;
  due: string;
  total: string;
};

type PlatformAnalytics = {
  name: string;
  totalRevenue: string;
  lastMonthRevenue: string;
  paymentsReceived: string;
  lastMonthStreams: string;
  logoSrc: string;
  logoFallback: string;
  logoTileClassName: string;
  logoImageClassName?: string;
  accentClassName: string;
  rows: PaymentRow[];
};

const platformAnalytics: Record<PlatformKey, PlatformAnalytics> = {
  "apple-music": {
    name: "Apple Music",
    totalRevenue: "$652,900",
    lastMonthRevenue: "$54,408",
    paymentsReceived: "52,100",
    lastMonthStreams: "10,652,900",
    logoSrc: "/appleMusic.png",
    logoFallback: "Apple",
    logoTileClassName: "bg-[linear-gradient(135deg,#fa2d48,#fb1ba5)]",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#ff8a1c]",
    rows: [
      { payStub: "6984", job: "Q1", po: "PO-1042", due: "May 12, 2026", total: "$3,040.00" },
      { payStub: "7012", job: "Q1", po: "PO-2208", due: "June 8, 2026", total: "$9,805.25" },
      { payStub: "7044", job: "Q1", po: "PO-2240", due: "June 14, 2026", total: "$3,500.00" },
      { payStub: "6890", job: "Q1", po: "PO-2141", due: "May 31, 2026", total: "$2,600.00" },
      { payStub: "6815", job: "Q1", po: "PO-2076", due: "May 24, 2026", total: "$1,800.00" },
    ],
  },
  spotify: {
    name: "Spotify",
    totalRevenue: "$718,420",
    lastMonthRevenue: "$61,772",
    paymentsReceived: "48,640",
    lastMonthStreams: "12,984,330",
    logoSrc: "https://cdn.simpleicons.org/spotify/1DB954",
    logoFallback: "Spotify",
    logoTileClassName: "bg-black",
    logoImageClassName: "scale-[0.78]",
    accentClassName: "text-[#1ed760]",
    rows: [
      { payStub: "8120", job: "Q1", po: "SP-3104", due: "May 15, 2026", total: "$4,920.00" },
      { payStub: "8166", job: "Q1", po: "SP-3188", due: "June 2, 2026", total: "$11,205.60" },
      { payStub: "8244", job: "Q1", po: "SP-3290", due: "June 12, 2026", total: "$6,430.25" },
      { payStub: "8078", job: "Q1", po: "SP-3019", due: "May 30, 2026", total: "$3,875.40" },
      { payStub: "8021", job: "Q1", po: "SP-2977", due: "May 22, 2026", total: "$2,960.00" },
    ],
  },
  "amazon-music": {
    name: "Amazon Music",
    totalRevenue: "$589,760",
    lastMonthRevenue: "$49,915",
    paymentsReceived: "39,840",
    lastMonthStreams: "8,904,650",
    logoSrc: "/amazonMusic.png",
    logoFallback: "Amazon",
    logoTileClassName: "bg-[#2ccfd2]",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#00a8e1]",
    rows: [
      { payStub: "5320", job: "Q1", po: "AM-4420", due: "May 10, 2026", total: "$3,880.00" },
      { payStub: "5374", job: "Q1", po: "AM-4482", due: "June 4, 2026", total: "$9,805.25" },
      { payStub: "5412", job: "Q1", po: "AM-4501", due: "June 16, 2026", total: "$4,220.00" },
      { payStub: "5288", job: "Q1", po: "AM-4396", due: "May 29, 2026", total: "$2,950.75" },
      { payStub: "5215", job: "Q1", po: "AM-4310", due: "May 21, 2026", total: "$2,110.00" },
    ],
  },
  soundcloud: {
    name: "SoundCloud",
    totalRevenue: "$421,300",
    lastMonthRevenue: "$37,540",
    paymentsReceived: "26,905",
    lastMonthStreams: "6,208,140",
    logoSrc: "https://cdn.simpleicons.org/soundcloud/FFFFFF",
    logoFallback: "SC",
    logoTileClassName: "bg-[#ff5500]",
    logoImageClassName: "scale-[0.82]",
    accentClassName: "text-[#ff8a1c]",
    rows: [
      { payStub: "4108", job: "Q1", po: "SC-1840", due: "May 11, 2026", total: "$3,040.00" },
      { payStub: "4162", job: "Q1", po: "SC-1902", due: "June 1, 2026", total: "$7,420.50" },
      { payStub: "4219", job: "Q1", po: "SC-1968", due: "June 13, 2026", total: "$3,280.00" },
      { payStub: "4077", job: "Q1", po: "SC-1795", due: "May 28, 2026", total: "$2,160.00" },
      { payStub: "4024", job: "Q1", po: "SC-1722", due: "May 20, 2026", total: "$1,540.25" },
    ],
  },
  youtube: {
    name: "YouTube",
    totalRevenue: "$806,215",
    lastMonthRevenue: "$72,460",
    paymentsReceived: "57,380",
    lastMonthStreams: "15,447,900",
    logoSrc: "https://cdn.simpleicons.org/youtube/FFFFFF",
    logoFallback: "YT",
    logoTileClassName: "bg-[#ff0000]",
    logoImageClassName: "scale-[0.72]",
    accentClassName: "text-[#ff3b30]",
    rows: [
      { payStub: "9205", job: "Q1", po: "YT-6041", due: "May 13, 2026", total: "$5,300.00" },
      { payStub: "9274", job: "Q1", po: "YT-6120", due: "June 6, 2026", total: "$12,980.25" },
      { payStub: "9311", job: "Q1", po: "YT-6174", due: "June 18, 2026", total: "$7,100.00" },
      { payStub: "9168", job: "Q1", po: "YT-5993", due: "May 31, 2026", total: "$4,880.00" },
      { payStub: "9102", job: "Q1", po: "YT-5905", due: "May 24, 2026", total: "$1,800.00" },
    ],
  },
  tiktok: {
    name: "TikTok",
    totalRevenue: "$934,120",
    lastMonthRevenue: "$84,330",
    paymentsReceived: "64,220",
    lastMonthStreams: "18,804,900",
    logoSrc: "/tiktok.png",
    logoFallback: "TikTok",
    logoTileClassName: "bg-black",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#25f4ee]",
    rows: [
      { payStub: "7401", job: "Q1", po: "TT-4410", due: "May 14, 2026", total: "$6,420.00" },
      { payStub: "7468", job: "Q1", po: "TT-4492", due: "June 7, 2026", total: "$14,905.25" },
      { payStub: "7519", job: "Q1", po: "TT-4560", due: "June 17, 2026", total: "$8,300.00" },
      { payStub: "7350", job: "Q1", po: "TT-4381", due: "May 30, 2026", total: "$5,160.00" },
      { payStub: "7292", job: "Q1", po: "TT-4316", due: "May 23, 2026", total: "$3,980.00" },
    ],
  },
  "iheart-radio": {
    name: "iHeartRadio",
    totalRevenue: "$376,450",
    lastMonthRevenue: "$31,880",
    paymentsReceived: "18,740",
    lastMonthStreams: "4,965,200",
    logoSrc: "/iheart.png",
    logoFallback: "iHeart",
    logoTileClassName: "bg-transparent",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#c6002b]",
    rows: [
      { payStub: "3501", job: "Q1", po: "IH-1028", due: "May 12, 2026", total: "$2,940.00" },
      { payStub: "3560", job: "Q1", po: "IH-1101", due: "June 3, 2026", total: "$6,125.25" },
      { payStub: "3614", job: "Q1", po: "IH-1160", due: "June 15, 2026", total: "$3,420.00" },
      { payStub: "3448", job: "Q1", po: "IH-0984", due: "May 29, 2026", total: "$2,070.00" },
      { payStub: "3395", job: "Q1", po: "IH-0922", due: "May 21, 2026", total: "$1,615.00" },
    ],
  },
  instagram: {
    name: "Instagram",
    totalRevenue: "$689,040",
    lastMonthRevenue: "$58,760",
    paymentsReceived: "43,900",
    lastMonthStreams: "9,881,400",
    logoSrc: "/instagram.png",
    logoFallback: "Instagram",
    logoTileClassName: "bg-transparent",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#e1306c]",
    rows: [
      { payStub: "6204", job: "Q1", po: "IG-2204", due: "May 13, 2026", total: "$4,700.00" },
      { payStub: "6272", job: "Q1", po: "IG-2295", due: "June 5, 2026", total: "$10,445.25" },
      { payStub: "6316", job: "Q1", po: "IG-2340", due: "June 16, 2026", total: "$5,680.00" },
      { payStub: "6150", job: "Q1", po: "IG-2167", due: "May 31, 2026", total: "$3,720.00" },
      { payStub: "6097", job: "Q1", po: "IG-2098", due: "May 24, 2026", total: "$2,480.00" },
    ],
  },
  pandora: {
    name: "Pandora",
    totalRevenue: "$512,880",
    lastMonthRevenue: "$45,220",
    paymentsReceived: "31,540",
    lastMonthStreams: "7,640,300",
    logoSrc: "/pandora.png",
    logoFallback: "Pandora",
    logoTileClassName: "bg-transparent",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#224099]",
    rows: [
      { payStub: "4802", job: "Q1", po: "PD-3305", due: "May 11, 2026", total: "$3,640.00" },
      { payStub: "4865", job: "Q1", po: "PD-3382", due: "June 2, 2026", total: "$8,705.25" },
      { payStub: "4921", job: "Q1", po: "PD-3440", due: "June 14, 2026", total: "$4,200.00" },
      { payStub: "4740", job: "Q1", po: "PD-3261", due: "May 30, 2026", total: "$2,940.00" },
      { payStub: "4689", job: "Q1", po: "PD-3187", due: "May 22, 2026", total: "$2,050.00" },
    ],
  },
  tidal: {
    name: "Tidal",
    totalRevenue: "$441,610",
    lastMonthRevenue: "$39,905",
    paymentsReceived: "22,870",
    lastMonthStreams: "5,995,100",
    logoSrc: "/tidal.png",
    logoFallback: "Tidal",
    logoTileClassName: "bg-transparent",
    logoImageClassName: "scale-[3.2]",
    accentClassName: "text-[#cfcfcf]",
    rows: [
      { payStub: "5706", job: "Q1", po: "TD-5004", due: "May 15, 2026", total: "$3,280.00" },
      { payStub: "5761", job: "Q1", po: "TD-5085", due: "June 6, 2026", total: "$7,950.25" },
      { payStub: "5814", job: "Q1", po: "TD-5140", due: "June 18, 2026", total: "$3,910.00" },
      { payStub: "5649", job: "Q1", po: "TD-4962", due: "May 30, 2026", total: "$2,775.00" },
      { payStub: "5598", job: "Q1", po: "TD-4890", due: "May 23, 2026", total: "$1,940.00" },
    ],
  },
};

function PlatformLogo({ platform, size = "lg" }: { platform: PlatformAnalytics; size?: "sm" | "lg" }) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center border border-[#303030] bg-[#060606]",
        size === "sm" ? "h-8 w-8 rounded-[7px] p-[2px]" : "h-[68px] w-[68px] rounded-[12px] p-1"
      )}
    >
      <div
        className={cn(
          "h-full w-full overflow-hidden",
          size === "sm" ? "rounded-[5px]" : "rounded-[9px]",
          platform.logoTileClassName
        )}
      >
        <img
          src={platform.logoSrc}
          alt={platform.name}
          className={cn("h-full w-full object-contain", platform.logoImageClassName)}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

function MetricCard({
  platform,
  label,
  value,
  emphasis = "green",
}: {
  platform: PlatformAnalytics;
  label: string;
  value: string;
  emphasis?: "green" | "accent";
}) {
  return (
    <section className="min-h-[128px] rounded-[7px] border border-[#282828] bg-black p-4">
      <p className="text-[16px] font-black leading-6 text-white">
        {platform.name}
        <br />
        {label}
      </p>
      <p className={cn("mt-6 text-[20px] font-black", emphasis === "green" ? "text-[#11f03b]" : platform.accentClassName)}>
        {value}
      </p>
    </section>
  );
}

export default async function PlatformIncomePage(props: PageProps<"/dashboard/income/[platform]">) {
  const { platform: platformSlug } = await props.params;
  const platform = platformAnalytics[platformSlug as PlatformKey];

  if (!platform) notFound();

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="border-b border-[#1e1e1e]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-5 px-4 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-10">
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center gap-2 rounded-[6px] border border-[#262626] bg-black px-4 text-[13px] font-black text-white hover:border-[#555]"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <div className="flex items-center gap-3">
              <PlatformLogo platform={platform} />
              <h1 className="text-[16px] font-black leading-6">
                {platform.name}
                <br />
                Income Analytics
              </h1>
            </div>
          </div>

          <div className="relative w-full max-w-[560px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#666]" />
            <input
              placeholder="Search invoice, payee, job, or status"
              className="h-11 w-full rounded-[6px] border border-[#292929] bg-black pl-12 pr-4 text-[14px] font-semibold text-white outline-none placeholder:text-[#656565]"
            />
          </div>

          <img
            src="/agncypaybrand.png"
            alt="AgncyPay"
            className="h-[52px] w-auto shrink-0 object-contain scale-[1.35] lg:origin-right"
          />
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] px-4 py-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <MetricCard platform={platform} label="Total revenue:" value={platform.totalRevenue} />
          <MetricCard platform={platform} label="Last Month revenue:" value={platform.lastMonthRevenue} />
          <MetricCard platform={platform} label="Payments Received:" value={platform.paymentsReceived} emphasis="accent" />
          <MetricCard platform={platform} label="Last Month Streams:" value={platform.lastMonthStreams} emphasis="accent" />
        </div>

        <section className="mx-auto mt-5 max-w-[1120px] overflow-hidden rounded-[8px] border border-[#282828] bg-black">
          <div className="flex items-center justify-between gap-4 border-b border-[#242424] p-5">
            <div>
              <h2 className="text-[16px] font-black text-white">Streaming Revenue Payments</h2>
              <p className="mt-2 text-[13px] font-semibold text-[#7e7e7e]">
                Review approved vendor invoices and submit payment through AgncyPay.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 rounded-[7px] border border-[#333] bg-black px-4 text-[13px] font-black text-white hover:border-[#666]"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] table-fixed text-left">
              <thead>
                <tr className="h-12 border-b border-[#252525] text-[11px] font-black uppercase text-[#666]">
                  <th className="w-[132px] px-14">Pay Stub #</th>
                  <th className="w-[230px] px-0">Payee</th>
                  <th className="w-[160px] px-0">Job</th>
                  <th className="w-[180px] px-0">Due</th>
                  <th className="w-[150px] px-0">Total</th>
                  <th className="w-[130px] px-0">Status</th>
                </tr>
              </thead>
              <tbody>
                {platform.rows.map((row, index) => (
                  <tr
                    key={row.payStub}
                    className={cn(
                      "h-[72px] border-b border-[#1d1d1d] text-[14px] font-semibold text-[#d8d8d8]",
                      index === 0 ? "bg-[#171717]" : "bg-black"
                    )}
                  >
                    <td className="px-14 font-black text-white">{row.payStub}</td>
                    <td className="px-0">
                      <div className="flex items-center gap-3">
                        <PlatformLogo platform={platform} size="sm" />
                        <span className="text-[11px] font-black text-white">{platform.name}</span>
                      </div>
                    </td>
                    <td className="px-0">
                      <p className="font-black text-white">{row.job}</p>
                      <p className="text-[12px] font-semibold text-[#777]">{row.po}</p>
                    </td>
                    <td className="px-0 text-[#b8b8b8]">{row.due}</td>
                    <td className="px-0 font-black text-white">{row.total}</td>
                    <td className="px-0">
                      <span className="inline-flex h-7 items-center gap-2 rounded-[7px] border border-[#00c76d] px-3 text-[11px] font-black text-white">
                        Paid
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#13e23b] text-black">
                          <Check className="h-3 w-3" />
                        </span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <footer className="mt-12 border-y border-[#242424]">
        <div className="mx-auto flex max-w-[1040px] flex-wrap items-center justify-center gap-8 px-4 py-8 text-[12px] font-bold text-white">
          <img src="/agncypaybrand.png" alt="AgncyPay" className="h-[48px] w-auto object-contain scale-[1.45]" />
          <Link href="/dashboard/support">Help</Link>
          <Link href="/dashboard/support">Contact Us</Link>
          <Link href="/dashboard/verification">Security</Link>
          <Link href="/dashboard/settings">Fees</Link>
        </div>
      </footer>
    </main>
  );
}
