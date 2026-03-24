import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main>
        <Hero />
        <Features />

        {/* CTA Section */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-emerald-600 px-6 py-24 shadow-2xl rounded-3xl sm:px-24">
              <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to transform your trade business?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-emerald-100">
                Join thousands of businesses already scaling with TradeTrack. Start your 14-day free trial today.
              </p>
              <div className="mt-10 flex justify-center gap-x-6">
                {/* 
                <a
                  href="/login"
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-emerald-600 shadow-sm hover:bg-emerald-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  Get started
                </a>
                */}
                <a href="#" className="text-sm font-semibold leading-6 text-white">
                  Learn more <span aria-hidden="true">→</span>
                </a>
              </div>
              <svg
                viewBox="0 0 1024 1024"
                className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
                aria-hidden="true"
              >
                <circle cx={512} cy={512} r={512} fill="url(#blue-gradient)" fillOpacity="0.7" />
                <defs>
                  <radialGradient id="blue-gradient">
                    <stop stopColor="#10b981" />
                    <stop offset={1} stopColor="#059669" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
