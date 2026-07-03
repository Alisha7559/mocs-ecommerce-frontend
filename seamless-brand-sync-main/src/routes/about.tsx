import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowRight, Wind, ShieldCheck, CheckCircle2, ChevronRight, Activity, Users } from "lucide-react";
import lifestyleMen from "@/assets/black sandals.png";
import { Reveal, Stagger } from "@/components/Reveal";
import { useState } from "react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About MOCS — Direct-to-Factory E-Commerce" },
      { name: "description", content: "MOCS designs premium footwear using advanced Polyurethane (PU)." },
    ],
  }),
  component: About,
});

const values = [
  {
    icon: Wind,
    title: "Lightweight Comfort",
    text: "Advanced direct-injection polyurethane creates micro-cellular air pockets, providing exceptional shock absorption while remaining 50% lighter than standard PVC."
  },
  {
    icon: Activity,
    title: "Extreme Flexibility",
    text: "Our PU formulations are certified to withstand over 150,000 flex cycles under rigorous testing, preventing sole cracks and maintaining rebound."
  },
  {
    icon: ShieldCheck,
    title: "Slip & Abrasion Resistance",
    text: "Engineered to meet national BIS standards for safety footwear, offering high abrasion resistance and secure traction on diverse surfaces."
  },
];

const qcSteps = [
  { num: "01", title: "Visual Upper Inspection", desc: "First check", points: ["Check stitching accuracy", "Inspect eyelet alignment"] },
  { num: "02", title: "Stitched Upper Audit", desc: "Pre-molding", points: ["Verify padding foam thickness", "Inspect logo precision"] },
  { num: "03", title: "Mould Check", desc: "Structure audit", points: ["Verify mold temperature", "Inspect polyol feed weight"] },
  { num: "04", title: "Direct Injection Audit", desc: "Bonding validation", points: ["Ensure chemical mix ratio", "Confirm injection timings"] },
  { num: "05", title: "Finished Sole Inspection", desc: "Post-bonding", points: ["Check flash trimming", "Test flex recovery of sole"] },
  { num: "06", title: "BIS 6721 Compliance", desc: "Flex & abrasion", points: ["Confirm Type-2 thickness", "Perform batch flex-fatigue tests"] },
  { num: "07", title: "Packaging Inspection", desc: "Final gate", points: ["Verify size label matches box", "Ensure tissue wrapping protects PU"] },
  { num: "08", title: "Feedback Loop", desc: "Post-delivery", points: ["Dealer & customer review", "Complaint analysis for upgrades"] }
];

function About() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div className="pb-16 text-left bg-background text-foreground">
      {/* Hero Header */}
      <section
        className="relative overflow-hidden py-24 text-white text-center border-b border-white/5 bg-zinc-950"
        style={{ clipPath: "inset(0 0 0 0)" }}
      >
        <div
          className="fixed inset-0 w-full h-full bg-cover bg-center pointer-events-none"
          style={{
            backgroundImage: `url('src/assets/UGG_platform_sandals_caramel_cream_202606301721.png_202607011036 copy.jpeg')`,
            zIndex: 0
          }}
        />
        <div className="absolute inset-0 bg-black/80 pointer-events-none" style={{ zIndex: 1 }} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" style={{ zIndex: 1 }} />
        <div className="relative mx-auto max-w-4xl px-4 z-10" style={{ zIndex: 2 }}>
          <Reveal>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-primary">Our Story & Infrastructure</p>
            <h1 className="mt-4 font-display text-5xl font-extrabold sm:text-7xl text-white tracking-tight leading-none font-black">
              We make you <span className="text-gradient">move different</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-zinc-400 text-sm sm:text-base leading-relaxed">
              MOCS is premium footwear engineered to move different. All components are manufactured directly in our own facilities — including plant upper parts. Doing all work in-house enables direct quality control and competitive pricing.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Industrial Scale Section (Clean Light Background) */}
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 text-foreground bg-background">
        <Reveal variant="left">
          <div className="relative group overflow-hidden rounded-3xl border border-border shadow-soft">
            <img
              src={lifestyleMen}
              alt="MOCS industrial lifestyle"
              loading="lazy"
              className="aspect-[4/5] w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
        </Reveal>
        <Reveal variant="right" className="text-left space-y-6">
          <span className="text-xs font-black uppercase tracking-widest text-primary">Manufacturing & Materials</span>
          <h2 className="font-display text-4xl font-extrabold sm:text-5xl text-foreground">Polyurethane (PU) Technology</h2>
          <p className="leading-relaxed text-muted-foreground text-sm sm:text-base">
            Polyurethane (PUR and PU) is a highly versatile, durable, and lightweight polymer. Formed by reacting polyols with diisocyanates, it provides unmatched rebound and comfort. Synthetic leather is built with premium PU and nylon components to mimic leather characteristics while remaining environmentally friendly.
          </p>
          <p className="leading-relaxed text-muted-foreground text-sm sm:text-base">
            Our direct injection pouring machines pour chemical mixtures straight into sole molds. This eliminates separation issues common in glued footwear. With heavy plant capacity, our units produce up to <strong>30,000 pairs per day</strong>! We are currently working on new plant lines, hitting an output of <strong>40,000 units per month</strong> of MOCS Plus.
          </p>

          <div className="grid grid-cols-2 gap-4 border-t border-border pt-6">
            <div>
              <p className="font-display text-3xl font-black text-primary">30,000+</p>
              <p className="text-xs text-muted-foreground">Pairs per day plant capacity</p>
            </div>
            <div>
              <p className="font-display text-3xl font-black text-foreground">A-to-Z</p>
              <p className="text-xs text-muted-foreground">Own manufacturing units</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* Core Values / Features Grid */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Stagger className="grid gap-6 md:grid-cols-3">
          {values.map((v) => (
            <Reveal
              key={v.title}
              className="rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-xl hover:border-primary/45 transition-all duration-500 hover:-translate-y-2 text-left group"
            >
              <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-primary duration-300">
                {v.title}
              </h3>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{v.text}</p>
            </Reveal>
          ))}
        </Stagger>
      </section>
      {/* Dealers as Family */}
      <section className="mx-auto max-w-5xl px-4 py-1 text-center">
        <Reveal className="rounded-3xl bg-gradient-to-r from-red-500 via-orange-500 to-orange-300 text-white p-8 md:p-12 relative overflow-hidden shadow-lift border border-white/10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/20 blur-3xl pointer-events-none" />
          <div className="absolute left-0 bottom-0 h-40 w-40 rounded-full bg-orange-700/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <Users className="h-10 w-10 text-white mx-auto" />

            <h2 className="font-display text-3xl font-extrabold sm:text-4xl text-white">
              Our Dealers are Family
            </h2>

            <p className="text-sm md:text-base text-white/90 leading-relaxed">
              We never compromise when it comes to meeting customer demands. All our dealers are family members to us. We recently conducted a dealer meetup and have plans for larger-scale conventions in the coming years.
            </p>
            <div className="pt-4">
              <Link
                to="/contact"
className="inline-flex items-center gap-2 rounded-full bg-black/40 backdrop-blur-md border border-white/20 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-black/60 hover:border-white/30 transition cursor-pointer"              >
                Partner with us <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
