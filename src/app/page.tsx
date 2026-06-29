"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, Building2, GraduationCap, Zap, Globe, Users, Star, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      
      {/* === ANIMATED INDIAN FLAG BACKGROUND === */}
      <div className="fixed inset-0 -z-10">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-green-50" />
        
        {/* Animated saffron wave - top */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-[40%] opacity-[0.08]"
          style={{
            background: "linear-gradient(180deg, #FF9933 0%, transparent 100%)",
          }}
          animate={{ 
            scaleY: [1, 1.05, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Animated green wave - bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[40%] opacity-[0.08]"
          style={{
            background: "linear-gradient(0deg, #138808 0%, transparent 100%)",
          }}
          animate={{ 
            scaleY: [1, 1.05, 1],
            opacity: [0.08, 0.12, 0.08],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Animated Ashoka Chakra - center */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.03]"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="100" cy="100" r="90" fill="none" stroke="#000088" strokeWidth="2" />
            <circle cx="100" cy="100" r="15" fill="#000088" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line
                key={i}
                x1="100"
                y1="100"
                x2={100 + 88 * Math.cos((i * 15 * Math.PI) / 180)}
                y2={100 + 88 * Math.sin((i * 15 * Math.PI) / 180)}
                stroke="#000088"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </motion.div>

        {/* Waving flag ribbons */}
        <motion.div 
          className="absolute -top-20 -right-20 w-[500px] h-[800px] opacity-[0.06] rotate-[30deg]"
          animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="h-1/3 bg-gradient-to-b from-orange-400 to-orange-300 rounded-full blur-3xl" />
          <div className="h-1/3 bg-gradient-to-b from-white to-blue-50 rounded-full blur-3xl" />
          <div className="h-1/3 bg-gradient-to-b from-green-400 to-green-300 rounded-full blur-3xl" />
        </motion.div>

        <motion.div 
          className="absolute -bottom-20 -left-20 w-[400px] h-[700px] opacity-[0.05] -rotate-[20deg]"
          animate={{ x: [0, -20, 0], y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <div className="h-1/3 bg-gradient-to-b from-orange-400 to-orange-300 rounded-full blur-3xl" />
          <div className="h-1/3 bg-gradient-to-b from-white to-blue-50 rounded-full blur-3xl" />
          <div className="h-1/3 bg-gradient-to-b from-green-400 to-green-300 rounded-full blur-3xl" />
        </motion.div>
      </div>

      {/* === HERO SECTION === */}
      <section className="relative w-full max-w-7xl mx-auto px-4 pt-16 pb-20 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full"
        >
          {/* Top Badge */}
          <div className="flex justify-center mb-8">
            <Badge className="bg-gradient-to-r from-orange-100 to-green-100 text-slate-800 hover:from-orange-200 hover:to-green-200 px-5 py-2 text-sm rounded-full border border-orange-200/50 shadow-sm font-medium">
              🇮🇳 India&apos;s Premier Training Marketplace
            </Badge>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 mb-6 leading-[1.1]">
            Where India&apos;s Best
            <br />
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-blue-700 to-green-600">
                Trainers
              </span>
            </span>
            {" "}Meet{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-700 to-orange-500">
              Opportunities
            </span>
          </h1>

          <p className="mt-4 text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed font-medium">
            All India Trainings connects certified professional trainers with corporate vendors across every state. 
            Post requirements, match skills instantly, and deliver excellence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center mb-16">
            <Link href="/signup/vendor">
              <Button size="lg" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-xl shadow-green-200 transition-all hover:scale-[1.03] font-bold cursor-pointer rounded-2xl">
                <Building2 className="mr-2 w-5 h-5" /> I am a Vendor
              </Button>
            </Link>
            <Link href="/signup/trainer">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-10 text-base sm:text-lg border-2 border-orange-300 text-orange-700 bg-white hover:bg-orange-50 shadow-lg shadow-orange-100 transition-all hover:scale-[1.03] font-bold cursor-pointer rounded-2xl">
                <GraduationCap className="mr-2 w-5 h-5" /> I am a Trainer
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 p-6 sm:p-8 bg-white/60 backdrop-blur-lg rounded-3xl border border-white/80 shadow-xl shadow-slate-100">
            {[
              { value: "28+", label: "States Covered", icon: <Globe className="w-5 h-5 text-orange-500" /> },
              { value: "5K+", label: "Expert Trainers", icon: <Users className="w-5 h-5 text-blue-600" /> },
              { value: "1.2K+", label: "Active Vendors", icon: <Building2 className="w-5 h-5 text-green-600" /> },
              { value: "98%", label: "Match Rate", icon: <Star className="w-5 h-5 text-amber-500" /> },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className="p-2 bg-slate-50 rounded-xl">{stat.icon}</div>
                <span className="text-2xl sm:text-3xl font-black text-slate-900">{stat.value}</span>
                <span className="text-xs sm:text-sm text-slate-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === HOW IT WORKS === */}
      <section className="relative w-full max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 border-none mb-4 px-4 py-1">How It Works</Badge>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Simple. Fast. <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-green-600">Powerful.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: "01",
                title: "Post or Register",
                description: "Vendors post training requirements with specific skills. Trainers sign up with OTP verification and complete their professional profile.",
                icon: <Shield className="w-7 h-7 text-orange-500" />,
                gradient: "from-orange-500 to-amber-500",
                bg: "bg-orange-50",
                border: "border-orange-100",
              },
              {
                step: "02",
                title: "Instant Skill Match",
                description: "Our smart matching engine automatically surfaces trainer profiles that match the exact skills a vendor requires — in real time.",
                icon: <Zap className="w-7 h-7 text-blue-600" />,
                gradient: "from-blue-600 to-indigo-600",
                bg: "bg-blue-50",
                border: "border-blue-100",
              },
              {
                step: "03",
                title: "Connect & Deliver",
                description: "Vendors review matched profiles, view full resumes, and directly connect with trainers to deliver world-class training programs.",
                icon: <CheckCircle2 className="w-7 h-7 text-green-600" />,
                gradient: "from-green-600 to-emerald-600",
                bg: "bg-green-50",
                border: "border-green-100",
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + idx * 0.15 }}
              >
                <Card className={`h-full border ${feature.border} shadow-lg hover:shadow-xl transition-all duration-300 ${feature.bg} backdrop-blur-sm group hover:-translate-y-1`}>
                  <CardContent className="pt-8 px-6 pb-8">
                    <div className="flex items-center gap-4 mb-5">
                      <div className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${feature.gradient} opacity-30`}>
                        {feature.step}
                      </div>
                      <div className="p-3 bg-white rounded-2xl shadow-sm">{feature.icon}</div>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-base">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* === FOR TRAINERS & VENDORS === */}
      <section className="relative w-full max-w-7xl mx-auto px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Trainer Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-full border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">For Trainers</h3>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "OTP-verified professional profiles",
                    "Showcase your skills and resume",
                    "Get matched to relevant opportunities",
                    "Connect with top vendors pan-India",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                      <CheckCircle2 className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup/trainer">
                  <Button className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-base shadow-lg shadow-orange-200 rounded-xl cursor-pointer">
                    Register as Trainer <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vendor Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Card className="h-full border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl hover:shadow-2xl transition-all group overflow-hidden">
              <CardContent className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">For Vendors</h3>
                </div>
                <ul className="space-y-4 mb-8">
                  {[
                    "Post training requirements instantly",
                    "AI-powered skill matching engine",
                    "View full trainer resumes & ratings",
                    "Manage all your training needs in one place",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 text-base">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/signup/vendor">
                  <Button className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold text-base shadow-lg shadow-green-200 rounded-xl cursor-pointer">
                    Register as Vendor <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* === FOOTER === */}
      <footer className="relative w-full border-t border-slate-200 bg-white/80 backdrop-blur-lg">
        <div className="flex h-[3px]">
          <div className="flex-1 bg-gradient-to-r from-orange-400 to-orange-500"></div>
          <div className="flex-1 bg-gradient-to-r from-white to-blue-100"></div>
          <div className="flex-1 bg-gradient-to-r from-green-500 to-green-600"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 via-white to-green-600 flex items-center justify-center shadow-md">
                <span className="text-sm font-black text-blue-900">A</span>
              </div>
              <span className="text-lg font-bold text-slate-900">All India Trainings</span>
            </div>
            <p className="text-sm text-slate-500 text-center">
              © 2026 All India Trainings. Empowering India&apos;s Training Ecosystem 🇮🇳
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
