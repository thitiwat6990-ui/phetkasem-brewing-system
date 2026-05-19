import Link from 'next/link';

export const metadata = {
  title: "MaewSalid Brewing System",
  description: "Advanced microbrewery management and fermentation tracking.",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-6 text-center relative overflow-hidden font-sans">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-brand-amber/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-brand-amber/5 rounded-full blur-[100px]" />

      <div className="z-10 bg-bg-panel border border-white/10 p-10 rounded-3xl shadow-2xl max-w-lg w-full">
        <h1 className="text-4xl font-black text-white uppercase tracking-wider mb-4 leading-tight">
          Welcome to <br/>
          <span className="text-brand-amber">Phetkasem Brewing System</span>
        </h1>
        <p className="text-text-secondary mb-10 text-sm md:text-base leading-relaxed">
          The ultimate control center for fermentation tracking, inventory management, and professional brewery operations.
        </p>

        <Link 
          href="/login" 
          className="inline-block w-full bg-brand-amber text-black font-black py-4 px-6 rounded-xl text-lg hover:scale-[1.02] transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(255,191,0,0.3)] hover:shadow-[0_0_25px_rgba(255,191,0,0.5)]"
        >
          Enter System
        </Link>
      </div>
    </div>
  );
}
