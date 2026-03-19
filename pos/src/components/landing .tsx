import React, { useState, useEffect, useRef } from 'react';
import {
  Menu, X, ArrowRight, PlayCircle, Users, Clock, MapPin, TrendingUp,
  ShoppingCart, Calendar, ChefHat, Package, CreditCard, BarChart3,
  UserCheck, Utensils, Shield, Zap, ClipboardCheck, Settings, Rocket,
  Monitor, Tablet, Smartphone, Quote, Star, Phone, Mail, CheckCircle2,
  ArrowUp,
} from 'lucide-react';

// ─────────────────────────────────────────────────
// Scroll Reveal Hook
// ─────────────────────────────────────────────────
function useScrollReveal(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

// ─────────────────────────────────────────────────
// Animated counter
// ─────────────────────────────────────────────────
function useCounter(target: number, duration = 1800, active = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, active]);
  return count;
}

// ─────────────────────────────────────────────────
// Reveal Wrapper
// ─────────────────────────────────────────────────
function Reveal({
  children, delay = 0, direction = 'up', className = '',
}: {
  children: React.ReactNode; delay?: number; direction?: 'up' | 'left' | 'right' | 'none'; className?: string;
}) {
  const { ref, visible } = useScrollReveal();
  const translateMap = { up: 'translateY(32px)', left: 'translateX(-32px)', right: 'translateX(32px)', none: 'none' };
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : translateMap[direction],
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────
// Stat counter block
// ─────────────────────────────────────────────────
function StatCounter({ value, suffix, label, active }: { value: number; suffix: string; label: string; active: boolean }) {
  const count = useCounter(value, 1600, active);
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-extrabold text-white mb-1 tabular-nums">{count}{suffix}</div>
      <div className="text-[#E4B315] text-sm font-semibold tracking-wide uppercase">{label}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Feature Card
// ─────────────────────────────────────────────────
function FeatureCard({ feature, delay }: { feature: any; delay: number }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(28px)',
        transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
      }}
      className="group rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl hover:shadow-[#E4B315]/10 hover:border-[#E4B315]/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
    >
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={feature.img}
          alt={feature.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute top-3 left-3 w-11 h-11 bg-gradient-to-br from-[#E4B315] to-[#C69A11] rounded-xl flex items-center justify-center shadow-lg">
          <feature.icon className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="p-5">
        <h3 className="text-base font-bold text-[#2D2A26] mb-1.5">{feature.title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────
export default function QuantPOSLanding() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Stats section reveal for counters
  const { ref: statsRef, visible: statsVisible } = useScrollReveal(0.3);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    
    // Ensure scroll is enabled
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';
    
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const features = [
    { title: "Food & Beverage POS", desc: "Cloud-based POS supporting dine-in, takeaway, and delivery with real-time sync.", icon: ShoppingCart, img: "/assets/ury/pos/assets/foordBeveragesPOS.jpg" },
    { title: "Event Management", desc: "Manage bookings, resource allocation, and event-specific costing for banquets.", icon: Calendar, img: "/assets/ury/pos/assets/eventManagement.jpg" },
    { title: "Table Reservations", desc: "Digital reservation system with real-time availability and automated confirmations.", icon: Users, img: "/assets/ury/pos/assets/tableResevations.jpg" },
    { title: "Recipe Module", desc: "Centralized recipe management with ingredients, portion control, and cost calculation.", icon: ChefHat, img: "/assets/ury/pos/assets/analyticsReporting.jpg" },
    { title: "Stock Management", desc: "Real-time inventory depletion, low stock alerts, and automated reordering.", icon: Package, img: "/assets/ury/pos/assets/stockManagement.jpg" },
    { title: "Financial Management", desc: "Complete accounting suite with multi-currency support and real-time reporting.", icon: CreditCard, img: "/assets/ury/pos/assets/finance.jpeg" },
    { title: "Analytics & Reporting", desc: "Real-time insights into sales, costs, profitability, and operational efficiency.", icon: BarChart3, img: "/assets/ury/pos/assets/analyticsReporting.jpg" },
    { title: "HR & Payroll", desc: "Employee management, attendance tracking, and automated payroll processing.", icon: UserCheck, img: "/assets/ury/pos/assets/parollHR.jpg" },
  ];

  const steps = [
    { icon: ClipboardCheck, step: "Step 1", title: "Request Demo", desc: "Schedule a personalized demo to see QuantPOS in action for your restaurant." },
    { icon: Settings, step: "Step 2", title: "Custom Setup", desc: "Our team configures the system to match your restaurant's unique workflows." },
    { icon: Rocket, step: "Step 3", title: "Go Live", desc: "Start using QuantPOS with comprehensive training for your entire team." },
    { icon: BarChart3, step: "Step 4", title: "Grow & Optimize", desc: "Use real-time analytics to identify opportunities and scale your business." },
  ];

  const testimonials = [
    { quote: "QuantPOS transformed our operations. We reduced food waste by 30% and increased table turnover by 25%. The real-time inventory tracking is a game-changer.", name: "James Mwangi", role: "Owner, Savanna Grill" },
    { quote: "The payroll and HR modules saved us countless hours. Staff scheduling used to take a full day - now it takes 30 minutes. Absolutely recommend it.", name: "Amina Hassan", role: "GM, Coastal Kitchen" },
    { quote: "Managing 5 locations was chaos before QuantPOS. Now I can monitor all restaurants from one dashboard. The financial reporting is exactly what we needed.", name: "Peter Ochieng", role: "Ops Director, Urban Bites" },
  ];

  return (
    <div className="font-sans bg-[#F9F9F8]" style={{ minHeight: '100vh', width: '100%', position: 'relative' }}>

      {/* ── GLOBAL ANIMATION STYLES ── */}
      <style>{`
        html, body {
          scroll-behavior: smooth;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
        #root {
          height: 100%;
          overflow-y: auto;
        }
        @keyframes heroFadeUp {
          from { opacity: 0; transform: translateY(40px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroBadge {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .hero-h1   { animation: heroFadeUp 0.8s ease 0.1s both; }
        .hero-p    { animation: heroFadeUp 0.8s ease 0.3s both; }
        .hero-btns { animation: heroFadeUp 0.8s ease 0.5s both; }
        .hero-stat { animation: heroFadeUp 0.8s ease 0.7s both; }
        .hero-badge{ animation: heroBadge 0.6s ease 0.05s both; }
        .float-card { animation: float 4s ease-in-out infinite; }
        .float-card-2 { animation: float 4s ease-in-out 2s infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #E4B315 0%, #FBD96A 40%, #E4B315 60%, #C69A11 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }
        .gold-line::after {
          content: '';
          display: block;
          width: 56px;
          height: 3px;
          background: linear-gradient(90deg, #E4B315, #C69A11);
          border-radius: 99px;
          margin: 12px auto 0;
        }
        .step-connector::after {
          content: '';
          position: absolute;
          top: 48px;
          left: calc(50% + 48px);
          width: calc(100% - 96px);
          height: 2px;
          background: linear-gradient(90deg, #E4B315/30, #E4B315/10);
          background: linear-gradient(90deg, rgba(228,179,21,0.3), rgba(228,179,21,0.05));
        }
        @media (max-width: 768px) { .step-connector::after { display: none; } }
      `}</style>

      {/* ══ NAVBAR ══ */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md shadow-black/5 border-b border-gray-200'
            : 'bg-[#F9F9F8]/80 backdrop-blur-sm border-b border-gray-200/50'
        }`}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <button className="flex items-center space-x-2.5 hover:opacity-80 transition-opacity">
              <img src="/assets/ury/pos/assets/logo.png" alt="QuantPOS Logo" className="h-40 w-auto object-contain" />
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#E4B315] to-[#C69A11] bg-clip-text text-transparent">
                QuantPOS
              </span>
            </button>

            <div className="hidden md:flex items-center space-x-7">
              <a href="#features" className="text-sm font-medium text-[#2D2A26] hover:text-[#E4B315] transition-colors duration-200">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-[#2D2A26] hover:text-[#E4B315] transition-colors duration-200">
                Pricing
              </a>
              <a href="#support" className="text-sm font-medium text-[#2D2A26] hover:text-[#E4B315] transition-colors duration-200">
                Support
              </a>
              <a href="#contact" className="text-sm font-medium text-[#2D2A26] hover:text-[#E4B315] transition-colors duration-200">
                Contact
              </a>
              <a href="#demo" className="text-sm font-semibold text-[#E4B315] hover:text-[#C69A11] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#E4B315] after:rounded-full">
                Demo
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-3">
              <button className="text-sm font-medium px-4 py-2 rounded-lg border border-[#E4B315] text-[#E4B315] hover:bg-[#E4B315]/8 transition-colors">
                Login
              </button>
              <button className="text-sm font-semibold px-5 py-2 rounded-lg bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-md shadow-[#E4B315]/20 hover:shadow-lg hover:shadow-[#E4B315]/30 hover:-translate-y-px transition-all">
                Get Started
              </button>
            </div>

            <button className="md:hidden p-2 text-[#2D2A26]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-5 space-y-3 shadow-xl">
            <a href="#features" className="block w-full text-left font-medium text-[#2D2A26] hover:text-[#E4B315] py-2 transition-colors">Features</a>
            <a href="#pricing" className="block w-full text-left font-medium text-[#2D2A26] hover:text-[#E4B315] py-2 transition-colors">Pricing</a>
            <a href="#demo" className="block w-full text-left font-medium text-[#2D2A26] hover:text-[#E4B315] py-2 transition-colors">Demo</a>
            <a href="#support" className="block w-full text-left font-medium text-[#2D2A26] hover:text-[#E4B315] py-2 transition-colors">Support</a>
            <a href="#contact" className="block w-full text-left font-medium text-[#2D2A26] hover:text-[#E4B315] py-2 transition-colors">Contact</a>
            <div className="pt-4 flex flex-col gap-3 border-t border-gray-100">
              <button className="w-full rounded-lg border border-[#E4B315] text-[#E4B315] py-2.5 font-medium hover:bg-[#E4B315]/8 transition-colors">Login</button>
              <button className="w-full rounded-lg bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white py-2.5 font-semibold shadow-md shadow-[#E4B315]/20">Get Started</button>
            </div>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/assets/ury/pos/assets/Gemini_Generated_Image_g5l77hg5l77hg5l7.png')" }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/25" />
          {/* Subtle grain overlay */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.4\'/%3E%3C/svg%3E")' }} />
        </div>

        {/* Decorative gold orbs */}
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#E4B315]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-[#E4B315]/8 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 container mx-auto px-6 py-28 pt-36">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full border border-[#E4B315]/40 bg-[#E4B315]/10 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E4B315] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E4B315]" />
              </span>
              <span className="text-[#E4B315] text-sm font-semibold tracking-wide">Cloud-First Restaurant ERP</span>
            </div>

            <h1 className="hero-h1 text-5xl md:text-7xl font-extrabold text-white mb-6 leading-[1.05] tracking-tight">
              Complete Restaurant
              <span className="block shimmer-text mt-1">Cloud Solution</span>
            </h1>

            <p className="hero-p text-lg md:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed">
              Streamline operations, boost profits, and enhance customer experience with QuantPOS's comprehensive cloud-based restaurant management platform.
            </p>

            <div className="hero-btns flex flex-col sm:flex-row gap-4 mb-14">
              <button className="group inline-flex items-center justify-center gap-2 h-14 rounded-xl bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white font-bold text-base px-8 shadow-xl shadow-[#E4B315]/30 hover:shadow-2xl hover:shadow-[#E4B315]/40 hover:-translate-y-0.5 transition-all duration-200">
                Try Interactive Demo
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-white/30 text-white font-semibold text-base px-8 hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">
                <PlayCircle className="h-5 w-5" /> Watch Overview
              </button>
            </div>

            <div className="hero-stat grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-white/10">
              {[
                { label: '24/7', sub: 'Support' },
                { label: 'Cloud', sub: 'Based' },
                { label: 'Real-time', sub: 'Sync' },
                { label: 'Scalable', sub: 'Solution' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl md:text-3xl font-extrabold text-white mb-1">{s.label}</div>
                  <div className="text-[#E4B315] text-xs font-semibold tracking-widest uppercase">{s.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60">
          <div className="w-0.5 h-10 bg-gradient-to-b from-white/0 to-white/60 rounded-full animate-bounce" />
          <span className="text-white/60 text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ══ STATS BANNER ══ */}
      <section className="py-14 bg-gradient-to-r from-[#E4B315] to-[#C69A11] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div ref={statsRef} className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCounter value={500} suffix="+" label="Restaurants" active={statsVisible} />
            <StatCounter value={99} suffix=".9%" label="Uptime" active={statsVisible} />
            <StatCounter value={15} suffix="+" label="Cities" active={statsVisible} />
            <StatCounter value={30} suffix="%" label="Avg. Cost Savings" active={statsVisible} />
          </div>
        </div>
      </section>

      {/* ══ FEATURES GRID ══ */}
      <section id="features" className="py-24 bg-[#F9F9F8]">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-[#E4B315] text-sm font-bold tracking-widest uppercase mb-3">Platform Modules</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#2D2A26] mb-5 leading-tight gold-line">
              Comprehensive Restaurant Management
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mt-6">
              From POS to payroll, our integrated ERP solution covers every aspect of your restaurant business
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
            {features.map((feature, idx) => (
              <FeatureCard key={idx} feature={feature} delay={idx * 60} />
            ))}
          </div>

          {/* Why Choose Banner */}
          <Reveal>
            <div className="bg-white border border-gray-200 rounded-3xl p-8 md:p-12 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-[#E4B315]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#E4B315]/4 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 pointer-events-none" />

              <h3 className="text-2xl md:text-3xl font-extrabold text-center text-[#2D2A26] mb-12 relative z-10 gold-line">
                Why Choose Our Restaurant ERP?
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {[
                  { icon: Utensils, title: 'Single Platform', desc: 'All restaurant operations unified in one comprehensive system' },
                  { icon: Clock, title: 'Real-time Ops', desc: 'Instant synchronization across all modules and locations' },
                  { icon: Shield, title: 'Compliance Ready', desc: 'Built-in compliance features and regular regulatory updates' },
                  { icon: Zap, title: 'Minimal Setup', desc: 'Use existing hardware with remote configuration and support' },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="mx-auto w-16 h-16 bg-[#E4B315]/10 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-[#E4B315]/20 group-hover:scale-110 transition-all duration-300">
                      <item.icon className="h-8 w-8 text-[#C69A11]" />
                    </div>
                    <h4 className="text-base font-bold text-[#2D2A26] mb-2">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="py-24 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-20">
            <p className="text-[#E4B315] text-sm font-bold tracking-widest uppercase mb-3">Process</p>
            <h2 className="text-4xl font-extrabold text-[#2D2A26] mb-4 gold-line">Get Started in 4 Simple Steps</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto mt-6">From demo to deployment in as little as one week</p>
          </Reveal>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-11 left-[14%] right-[14%] h-px bg-gradient-to-r from-[#E4B315]/10 via-[#E4B315]/40 to-[#E4B315]/10 z-0" />

            {steps.map((s, i) => (
              <Reveal key={i} delay={i * 120} direction="up">
                <div className="relative text-center group z-10">
                  <div className="w-[88px] h-[88px] mx-auto mb-6 rounded-3xl bg-white border-2 border-gray-100 flex items-center justify-center shadow-lg shadow-gray-100/80 group-hover:border-[#E4B315]/50 group-hover:shadow-[#E4B315]/15 group-hover:-translate-y-2 transition-all duration-300">
                    <s.icon className="h-9 w-9 text-[#E4B315]" />
                  </div>
                  <div className="inline-block px-3.5 py-1 rounded-full bg-[#E4B315]/10 text-[#C69A11] text-xs font-bold mb-3 tracking-wide">{s.step}</div>
                  <h3 className="text-lg font-bold text-[#2D2A26] mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PREVIEW & DEMO ══ */}
      <section id="demo" className="py-24 bg-[#F9F9F8] border-t border-gray-200 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal direction="left">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E4B315]/10 text-[#C69A11] text-sm font-bold mb-6">
                  <Monitor className="h-4 w-4" /> Interactive Demo Available
                </div>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-[#2D2A26] mb-6 leading-tight">
                  See QuantPOS<br />in Action
                </h2>
                <p className="text-lg text-gray-500 mb-8 leading-relaxed">
                  Explore our fully interactive demo with sample data. No signup required. Experience the complete restaurant management platform from POS to payroll.
                </p>
                <ul className="space-y-3.5 mb-10">
                  {[
                    "Full POS system with table management",
                    "Kitchen display with real-time order tracking",
                    "Inventory management and recipe costing",
                    "Staff scheduling and payroll processing",
                    "Financial reports and analytics dashboard",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-[#E4B315] shrink-0" />
                      <span className="text-[#2D2A26] font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="group inline-flex items-center justify-center gap-2 font-bold h-12 rounded-xl px-7 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white shadow-md shadow-[#E4B315]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all text-sm">
                    Try Interactive Demo <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="inline-flex items-center justify-center gap-2 font-bold border-2 bg-white h-12 rounded-xl px-7 border-gray-200 text-[#2D2A26] hover:border-[#E4B315] hover:text-[#E4B315] transition-all text-sm">
                    Request Full Access
                  </button>
                </div>
                <div className="flex items-center gap-7 mt-9 text-sm text-gray-400 font-medium">
                  <div className="flex items-center gap-2"><Monitor className="h-4 w-4" /> Desktop</div>
                  <div className="flex items-center gap-2"><Tablet className="h-4 w-4" /> Tablet</div>
                  <div className="flex items-center gap-2"><Smartphone className="h-4 w-4" /> Mobile</div>
                </div>
              </div>
            </Reveal>

            <Reveal direction="right">
              <div className="relative lg:ml-8">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#E4B315]/15 to-transparent rounded-3xl transform rotate-3 scale-105 -z-10" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200 bg-white p-2">
                  <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
                    {/* Mock dashboard preview */}
                    <div className="w-full h-full p-5">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                        <div className="flex-1 mx-4 h-5 rounded-full bg-gray-200" />
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-4">
                        {['bg-[#E4B315]/20', 'bg-blue-100', 'bg-green-100', 'bg-purple-100'].map((c, i) => (
                          <div key={i} className={`${c} rounded-lg p-2.5`}>
                            <div className="h-1.5 bg-gray-300 rounded w-3/4 mb-1.5" />
                            <div className="h-4 bg-gray-400 rounded w-1/2" />
                          </div>
                        ))}
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-3 h-24">
                          <div className="h-1.5 bg-gray-200 rounded w-1/2 mb-3" />
                          <div className="flex items-end gap-1.5 h-12">
                            {[40, 65, 45, 80, 55, 70, 90].map((h, i) => (
                              <div key={i} className="flex-1 bg-[#E4B315]/60 rounded-sm" style={{ height: `${h}%` }} />
                            ))}
                          </div>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3 space-y-2">
                          {[75, 55, 45].map((w, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-5 h-5 rounded-full bg-gray-200 shrink-0" />
                              <div className="h-1.5 bg-gray-200 rounded flex-1" style={{ width: `${w}%` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating stat cards */}
                <div className="float-card absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="text-2xl font-black text-[#E4B315]">98%</div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">User Satisfaction</div>
                </div>
                <div className="float-card-2 absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
                  <div className="text-2xl font-black text-[#E4B315]">24/7</div>
                  <div className="text-xs font-semibold text-gray-500 mt-0.5">Live Support</div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-[#E4B315] text-sm font-bold tracking-widest uppercase mb-3">Social Proof</p>
            <h2 className="text-4xl font-extrabold text-[#2D2A26] mb-4 gold-line">Trusted by Leading Restaurants</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto mt-6">
              See how QuantPOS is helping restaurants streamline operations and boost profits.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => (
              <Reveal key={i} delay={i * 120}>
                <div className="group bg-[#F9F9F8] rounded-3xl p-8 border border-gray-100 relative hover:border-[#E4B315]/30 hover:shadow-lg hover:shadow-[#E4B315]/8 hover:-translate-y-1 transition-all duration-300">
                  <Quote className="absolute top-7 right-7 h-10 w-10 text-[#E4B315]/12" />
                  <div className="flex gap-1 mb-5">
                    {[1,2,3,4,5].map(j => <Star key={j} className="h-4 w-4 fill-[#E4B315] text-[#E4B315]" />)}
                  </div>
                  <p className="text-[#2D2A26] mb-7 leading-relaxed text-base font-medium relative z-10">"{t.quote}"</p>
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#E4B315]/30 to-[#C69A11]/20 flex items-center justify-center text-[#C69A11] font-extrabold text-base">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-[#2D2A26] text-sm">{t.name}</div>
                      <div className="text-xs text-gray-500">{t.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CALL TO ACTION ══ */}
      <section id="contact" className="py-24 bg-gradient-to-br from-[#E4B315] via-[#D4A712] to-[#C69A11] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <Reveal className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
              Ready to Transform<br />Your Restaurant?
            </h2>
            <p className="text-lg text-white/90 mb-10 font-medium">
              Join hundreds of restaurants that have modernized their operations with QuantPOS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="group inline-flex items-center justify-center gap-2 font-bold h-14 rounded-xl bg-white text-[#C69A11] hover:bg-gray-50 text-base px-9 shadow-2xl hover:-translate-y-0.5 transition-all">
                Request Demo <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="inline-flex items-center justify-center gap-2 font-bold border-2 h-14 rounded-xl border-white text-white hover:bg-white/12 text-base px-9 transition-all">
                Try Interactive Demo
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-white/90 font-medium text-sm">
              <a href="tel:+254759694640" className="flex items-center gap-2 hover:text-white transition-colors">
                <Phone className="h-4 w-4" /> +254 759 694 640
              </a>
              <a href="mailto:sales@QuantPOS.africa" className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="h-4 w-4" /> sales@QuantPOS.africa
              </a>
            </div>
          </div>
        </Reveal>
      </section>

      

      {/* ══ FOOTER ══ */}
      <footer id="support" className="bg-[#1E1C18] text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2 pr-8">
              <div className="flex items-center space-x-3 mb-5">
                <img src="/assets/ury/pos/assets/logo.png" alt="QuantPOS Logo" className="h-52 w-auto object-contain" />
                <span className="text-2xl font-extrabold tracking-tight">QuantPOS</span>
              </div>
              <p className="text-gray-400 mb-7 max-w-md leading-relaxed text-sm">
                Comprehensive cloud-based Restaurant ERP solution designed for modern food & beverage businesses. Streamline operations from POS to payroll with our integrated platform.
              </p>
              <div className="space-y-3.5">
                {[
                  { icon: MapPin, text: 'Kenya: P.O Box 76171 - 00508' },
                  { icon: Phone, text: '+254 759 694 640' },
                  { icon: Mail, text: 'sales@QuantPOS.africa' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-3 text-sm">
                    <item.icon className="h-4 w-4 text-[#E4B315] shrink-0" />
                    <span className="text-gray-300">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-5 text-white tracking-wider uppercase">Solutions</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {['POS Dashboard', 'Event Management', 'Table Reservations', 'Inventory Management', 'Financial Management', 'HR & Payroll', 'Recipe Management', 'Analytics & Reporting'].map(link => (
                  <li key={link}><a href="#" className="hover:text-[#E4B315] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold mb-5 text-white tracking-wider uppercase">Support</h3>
              <ul className="space-y-2.5 text-sm text-gray-400">
                {['24/7 Remote Support', 'Local On-demand Service', 'Documentation', 'Training Programs', 'System Updates', 'Compliance Support'].map(link => (
                  <li key={link}><a href="#" className="hover:text-[#E4B315] transition-colors">{link}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm mb-4 md:mb-0">© 2024 QuantPOS Africa. All rights reserved.</p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              {['Privacy Policy', 'Terms of Service', 'Support'].map(link => (
                <a key={link} href="#" className="hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ══ SCROLL TO TOP BUTTON ══ */}
      {scrolled && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gradient-to-r from-[#E4B315] to-[#C69A11] text-white rounded-full shadow-lg shadow-[#E4B315]/30 hover:shadow-xl hover:shadow-[#E4B315]/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      )}
    </div>
  );
}