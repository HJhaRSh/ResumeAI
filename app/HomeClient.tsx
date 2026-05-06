"use client";

import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Cpu, Loader2, Sparkles, Upload, FileText, Zap, ShieldCheck, BarChart3, Clock, Trophy, Lock, Github, Linkedin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import Marquee from "react-fast-marquee";

import { FilePreview } from "@/components/upload/FilePreview";
import { ParseProgress } from "@/components/upload/ParseProgress";
import { UploadZone } from "@/components/upload/UploadZone";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { useAnalysis } from "@/hooks/useAnalysis";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] } },
};

function Banner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="mx-auto w-full max-w-xl rounded-2xl border border-amber-400/35 bg-gradient-to-r from-amber-50 via-white to-amber-50/40 p-4 text-center text-sm font-semibold text-amber-950 shadow-lg shadow-amber-900/10 ring-1 ring-white/60"
      role="status"
    >
      {message}
    </motion.div>
  );
}

function LoadingShell() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-app-gradient">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-55" />
      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col gap-10 px-5 py-16">
        <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4">
          <div className="h-14 w-[min(520px,100%)] animate-pulse rounded-3xl bg-zinc-900/55 ring-1 ring-stone-900/10 backdrop-blur-sm" />
          <div className="h-6 w-[min(360px,100%)] animate-pulse rounded-full bg-zinc-900/35" />
          <div className="h-[180px] w-full max-w-xl animate-pulse rounded-3xl bg-gradient-to-br from-white/45 via-white/20 to-emerald-100/30 ring-1 ring-stone-900/10 backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
}

function FloatingBadges() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full z-0">
      <motion.div 
        className="absolute top-[15%] left-[5%] hidden md:flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl"
        animate={{ y: [0, -10, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Trophy className="h-4 w-4 text-amber-400" />
        <span className="text-xs font-bold text-white/90">98% Success Rate</span>
      </motion.div>
      <motion.div 
        className="absolute top-[45%] right-[8%] hidden md:flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl"
        animate={{ y: [0, 15, 0], rotate: [1, -1, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Clock className="h-4 w-4 text-sky-400" />
        <span className="text-xs font-bold text-white/90">15s Avg. Processing</span>
      </motion.div>
      <motion.div 
        className="absolute top-[25%] right-[5%] hidden md:flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl"
        animate={{ y: [0, -12, 0], x: [0, 5, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        <span className="text-xs font-bold text-white/90">Privacy First</span>
      </motion.div>
    </div>
  );
}

function HomeInner() {
  const searchParams = useSearchParams();

  const notice = useMemo(() => {
    const n = searchParams.get("notice");
    if (!n) return null;
    if (n === "please-upload") return "Please upload your resume first.";
    return null;
  }, [searchParams]);

  const [file, setFile] = useState<File | null>(null);
  const [uploadErr, setUploadErr] = useState<string | null>(null);
  const [jobDesc, setJobDesc] = useState("");

  const analysis = useAnalysis();

  const canSubmit = Boolean(file) && !analysis.isAnalyzing;

  const errorToShow = uploadErr ?? analysis.error;

  const howSteps = useMemo(
    () => [
      {
        Icon: Upload,
        title: "Upload your resume",
        body: "PDF or DOCX, any template",
        accent: "from-sky-500/20 to-transparent",
        iconColor: "text-sky-400"
      },
      {
        Icon: Cpu,
        title: "18 ATS rules checked",
        body: "Format, content, keywords, impact",
        accent: "from-violet-500/20 to-transparent",
        iconColor: "text-violet-400"
      },
      {
        Icon: Sparkles,
        title: "Get your score + fixes",
        body: "Prioritised by what matters most",
        accent: "from-emerald-500/20 to-transparent",
        iconColor: "text-emerald-400"
      },
    ],
    [],
  );

  const features = [
    { icon: FileText, title: "Deep Content Analysis", desc: "We evaluate action verbs, metrics, and keyword relevance." },
    { icon: Zap, title: "Lightning Fast", desc: "Instant feedback powered by advanced edge computing." },
    { icon: BarChart3, title: "Impact Scoring", desc: "Detailed breakdown of where your resume excels or fails." },
    { icon: ShieldCheck, title: "100% Secure", desc: "Your files never touch our servers. Processed entirely in memory." },
  ];

  const atsSystems = [
    "Workday", "Greenhouse", "Lever", "Taleo", "iCIMS", "BambooHR", "Jobvite", "Ashby", "Breezy", "SmartRecruiters"
  ];

  return (
    <div className="relative overflow-x-hidden bg-app-gradient text-white">
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.85]" />

      <div className="animate-blob pointer-events-none absolute -top-52 left-[10%] h-[460px] w-[460px] rounded-full bg-violet-600/20 blur-[100px]" />
      <div className="animate-blob animation-delay-2000 pointer-events-none absolute top-[22%] -right-32 h-[340px] w-[340px] rounded-full bg-fuchsia-600/20 blur-[90px]" />
      <div className="animate-blob animation-delay-4000 pointer-events-none absolute top-[60%] left-1/3 h-[420px] w-[420px] rounded-full bg-cyan-600/20 blur-[100px]" />

      <FloatingBadges />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-14 px-6 pt-28 pb-0 sm:pt-40 sm:pb-0">
        <motion.header
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center space-y-6 relative z-10"
        >
          <motion.div variants={item} className="flex justify-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:bg-white/10 hover:border-white/20"
            >
              <motion.span
                className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.6)] ring-1 ring-white/30"
                whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                transition={{ duration: 0.5 }}
              >
                <BadgeCheck className="h-5 w-5" aria-hidden />
              </motion.span>
              <span className="bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-2xl font-black tracking-tight text-transparent sm:text-3xl">
                ResumeCheck <span className="text-violet-400 font-bold ml-1">AI</span>
              </span>
            </Link>
          </motion.div>

          <motion.div variants={item} className="space-y-4 pt-4">
            <h1 className="mx-auto max-w-4xl text-balance text-3xl font-black leading-[1.1] tracking-tight text-white sm:text-6xl md:text-7xl">
              Stop guessing why your resume gets{" "}
              <motion.span 
                className="relative inline-block whitespace-nowrap mt-2"
                whileHover={{ scale: 1.05, rotate: -2 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-2 h-4 rounded-full bg-rose-500/40 blur-[8px]"
                />
                <span className="relative bg-gradient-to-r from-rose-400 via-fuchsia-500 to-violet-500 bg-clip-text text-transparent drop-shadow-sm">rejected.</span>
              </motion.span>
            </h1>
            <p className="mx-auto max-w-2xl text-[17px] leading-relaxed text-zinc-300 font-medium">
              Join thousands of job seekers who fixed their resumes. Get an instant, deep-dive ATS analysis prioritizing the exact changes that move the needle.
            </p>
          </motion.div>

          <motion.ul
            variants={item}
            className="flex flex-wrap items-center justify-center gap-3 pt-4"
          >
            {["No data stored", "Works for PDF & DOCX", "Built for Indian freshers"].map((label) => (
              <motion.li key={label} whileHover={{ y: -3, scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Badge className="border-white/10 bg-white/5 px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.15em] text-zinc-200 shadow-xl backdrop-blur-md ring-1 ring-white/5 hover:bg-white/10 transition-colors">
                  {label}
                </Badge>
              </motion.li>
            ))}
          </motion.ul>
        </motion.header>

        <main className="flex flex-col items-center gap-8 relative z-10">
          <Banner message={notice} />

          <div className="w-full max-w-2xl mx-auto z-20 relative">
            <div className="w-full rounded-3xl p-[1px] bg-gradient-to-b from-white/15 to-white/5 shadow-2xl backdrop-blur-xl transition-transform duration-300">
              <div className="bg-zinc-950/80 rounded-[calc(1.5rem-1px)] p-6 sm:p-8">
                <UploadZone
                  disabled={analysis.isAnalyzing}
                  onAccepted={(f) => {
                    setUploadErr(null);
                    analysis.clearError();
                    setFile(f);
                  }}
                  onInvalid={(msg) => {
                    setUploadErr(msg);
                    setFile(null);
                  }}
                />

                <AnimatePresence mode="wait">
                  {file ? (
                    <div key={file.name} className="w-full mt-6 space-y-4">
                      <FilePreview
                        file={file}
                        disabled={analysis.isAnalyzing}
                        onRemove={() => {
                          setFile(null);
                          setUploadErr(null);
                          setJobDesc("");
                          analysis.clearError();
                        }}
                      />
                      
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-full text-left"
                      >
                        <label htmlFor="jd-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">
                          Optional: Target Job Description
                        </label>
                        <textarea
                          id="jd-input"
                          placeholder="Paste the job description here to check for missing keywords..."
                          value={jobDesc}
                          onChange={(e) => setJobDesc(e.target.value)}
                          disabled={analysis.isAnalyzing}
                          className="w-full h-24 rounded-2xl bg-zinc-900/50 border border-white/5 p-4 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none shadow-inner"
                        />
                      </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      key="hint"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 text-center"
                    >
                      <p className="text-sm font-medium leading-relaxed text-zinc-400 bg-zinc-900/50 inline-block px-4 py-2 rounded-full border border-white/5">
                        Tip: exporting as a{' '}
                        <span className="font-bold text-white">vector PDF from Word</span>{' '}
                        parses best.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-6">
                  <motion.div whileHover={canSubmit ? { y: -2, scale: 1.01 } : undefined} whileTap={canSubmit ? { scale: 0.98 } : undefined}>
                    <Button
                      type="button"
                      className="group relative isolate h-14 w-full overflow-hidden rounded-2xl text-[17px] shadow-[0_0_40px_rgba(139,92,246,0.3)] ring-1 ring-white/20 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-orange-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-orange-400 transition-all duration-300"
                      disabled={!canSubmit}
                      onClick={async () => {
                        if (!file) return;
                        await analysis.runPipeline(file, jobDesc);
                      }}
                    >
                      <span className="pointer-events-none absolute inset-x-0 top-0 h-full w-full bg-gradient-to-b from-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                      {analysis.isAnalyzing ? (
                        <span className="flex items-center gap-3">
                          <Loader2 className="h-6 w-6 animate-spin text-white" aria-hidden />
                          Analysing document...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <span className="font-extrabold tracking-wide text-white drop-shadow-md">Analyse my resume</span>
                          <motion.span
                            aria-hidden
                            className="text-xl leading-none text-white font-bold"
                            animate={{ x: [0, 4, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                          >
                            →
                          </motion.span>
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </div>

                <ParseProgress active={analysis.isAnalyzing} />

                <AnimatePresence>
                  {errorToShow ? (
                    <motion.div
                      key="err"
                      initial={{ opacity: 0, y: 14, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30 }}
                      className="mt-6 w-full overflow-hidden rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm shadow-xl backdrop-blur-md"
                    >
                      <p className="font-extrabold text-rose-300">Something went wrong</p>
                      <p className="mt-2 text-[14px] font-medium leading-relaxed text-rose-200/80">
                        {errorToShow}
                      </p>
                      <div className="mt-4">
                        <Button
                          type="button"
                          variant="secondary"
                          className="bg-rose-950/50 hover:bg-rose-900/50 text-rose-200 border-rose-800/50"
                          onClick={() => {
                            setUploadErr(null);
                            analysis.clearError();
                          }}
                        >
                          Try again
                        </Button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </main>

        <div className="my-10 w-full overflow-hidden flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-6 text-center">Compatible with top ATS software</p>
          <div className="w-full max-w-6xl opacity-60 hover:opacity-100 transition-opacity duration-500">
            <Marquee gradient={true} gradientColor="#030303" gradientWidth={100} speed={40} autoFill>
              {atsSystems.map((sys, i) => (
                <div key={i} className="mx-8 flex items-center justify-center">
                  <span className="text-xl font-black tracking-tighter text-zinc-400">{sys}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </div>

        <div id="features" className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center mt-10 scroll-mt-28">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">maximum impact</span>.
              </h2>
              <p className="mt-4 text-lg text-zinc-400 leading-relaxed">
                Our parsing engine runs 18 distinct checks simulating the most rigorous Applicant Tracking Systems on the market.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {features.map((feat, i) => (
                <div 
                  key={i} 
                  className="group flex flex-col gap-3 p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-emerald-500/[0.03] hover:border-emerald-500/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)]"
                >
                  <div className="h-10 w-10 rounded-xl bg-zinc-900 flex items-center justify-center ring-1 ring-white/10 shadow-lg group-hover:bg-emerald-500/10 group-hover:ring-emerald-500/30 transition-all duration-300">
                    <feat.icon className="h-5 w-5 text-zinc-300 group-hover:text-emerald-400 transition-colors" />
                  </div>
                  <h3 className="font-bold text-white text-[15px] group-hover:text-emerald-50 group-hover:translate-x-1 transition-all">{feat.title}</h3>
                  <p className="text-sm text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">{feat.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.section
            id="how-it-works"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="card-glass w-full p-8 relative overflow-hidden scroll-mt-28"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
            
            <h2 className="text-[11px] font-black uppercase tracking-[0.35em] text-zinc-500 mb-8 relative z-10">
              How it works
            </h2>
            <div className="flex flex-col gap-6 relative z-10">
              {howSteps.map(({ Icon, title, body, accent, iconColor }, i) => (
                <motion.article
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15, duration: 0.5 }}
                  className="group flex gap-5 items-start"
                >
                  <div className="relative flex-shrink-0">
                    <div className={cn("absolute inset-0 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br", accent)} />
                    <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-zinc-900/80 text-white shadow-xl ring-1 ring-white/10 backdrop-blur-md group-hover:ring-white/20 transition-all">
                      <Icon className={cn("relative h-6 w-6", iconColor)} aria-hidden />
                    </div>
                    {i !== howSteps.length - 1 && (
                      <div className="absolute top-14 bottom-[-1.5rem] left-1/2 w-px bg-gradient-to-b from-white/10 to-transparent -translate-x-1/2" />
                    )}
                  </div>
                  <div className="pt-2">
                    <p className="text-[17px] font-bold text-white group-hover:text-zinc-100 transition-colors">{title}</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-zinc-400 group-hover:text-zinc-300 transition-colors">{body}</p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.section>
        </div>

        {/* Privacy Section */}
        <motion.section
          id="privacy"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-6xl mx-auto mt-24 p-10 md:p-16 card-glass relative overflow-hidden scroll-mt-28"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
          
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="flex items-center justify-center gap-2 mb-6 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                100% Secure & Private
              </p>
            </div>
            
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Your data belongs to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">you.</span></h2>
            <p className="text-zinc-400 max-w-2xl text-[15px] leading-relaxed">
              We built ResumeCheck AI with absolute privacy as the foundational principle. You don&apos;t need to trust us with your data, because we never keep it.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 text-left mt-12 relative z-10">
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="h-10 w-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-emerald-500/20">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold text-[16px] mb-2">Stateless Analysis</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Your resume is parsed entirely in memory. As soon as your browser closes or the analysis is complete, all traces of your file are instantly destroyed.</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="h-10 w-10 bg-sky-500/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-sky-500/20">
                <Lock className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-white font-bold text-[16px] mb-2">Zero Database Storage</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">We do not own, maintain, or use any databases to harvest your personal information, work history, or contact details.</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl hover:bg-white/10 transition-colors">
              <div className="h-10 w-10 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-violet-500/20">
                <Cpu className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-white font-bold text-[16px] mb-2">No AI Training</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">Your resume will absolutely never be used to train, fine-tune, or improve our AI models or any third-party APIs.</p>
            </div>
          </div>
        </motion.section>

        {/* Footer */}
        <footer className="w-full mt-20 pb-10 relative z-10 flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-5">
            <a href="https://github.com/HJhaRSh" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://www.linkedin.com/in/harsh-jain09/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-[#0077b5] transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
          
          <div className="text-center">
            <p className="text-base font-black text-white tracking-tight">Harsh Jain</p>
            <p className="text-[9px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Software Engineer & Vibe Coder</p>
          </div>
          
          <p className="text-[10px] font-bold text-zinc-700 tracking-wide">
            &copy; {new Date().getFullYear()} Harsh Jain. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

export function HomeClient() {
  return (
    <Suspense fallback={<LoadingShell />}>
      <HomeInner />
    </Suspense>
  );
}

