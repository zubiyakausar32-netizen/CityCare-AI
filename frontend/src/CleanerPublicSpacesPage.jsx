import { Link } from 'react-router-dom';
import { ArrowLeft, Recycle } from 'lucide-react';

function CleanerPublicSpacesPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft">
              <img src="/citycare-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">CityCare AI</div>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Smarter Cities. Cleaner Tomorrow.</div>
            </div>
          </Link>
          <Link to="/sdg-11" className="secondary-button gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to SDG 11
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="card p-8 sm:p-12">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Recycle className="h-7 w-7" />
          </div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Sustainable Development Goal 11</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
            Cleaner public spaces and waste monitoring
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Clean, well-maintained public spaces make neighborhoods healthier and more welcoming. CityCare helps residents report overflowing bins, illegal dumping, and other waste concerns so city teams can see where cleanup is needed.
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <h2 className="font-bold text-slate-900">Report local issues</h2>
              <p className="mt-2 text-slate-600">
                Share the location and details of waste problems to help direct cleanup and collection efforts.
              </p>
            </section>
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="font-bold text-slate-900">Monitor service response</h2>
              <p className="mt-2 text-slate-600">
                Follow reported issues through review and resolution, and use complaint trends to spot areas needing attention.
              </p>
            </section>
          </div>

          <Link to="/report" className="primary-button mt-8">
            Report a waste issue
          </Link>
        </article>
      </main>
    </div>
  );
}

export default CleanerPublicSpacesPage;
