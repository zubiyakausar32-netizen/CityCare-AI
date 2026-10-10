import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BarChart3,
  BellRing,
  CheckCircle2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';

const features = [
  {
    title: 'AI-powered issue classification',
    description: 'Complaint descriptions are analyzed and assigned to a civic issue category, helping teams organize incoming reports.',
    icon: <Zap className="h-6 w-6" />,
  },
  {
    title: 'Simple location-based reporting',
    description: 'Residents can include a neighborhood or location with each report so service teams know where attention is needed.',
    icon: <MapPin className="h-6 w-6" />,
  },
  {
    title: 'Priority and status tracking',
    description: 'Track reports from submission through review, active work, and resolution, with priority information visible in the service queue.',
    icon: <CheckCircle2 className="h-6 w-6" />,
  },
  {
    title: 'Service alerts and hotspots',
    description: 'Highlight high-priority issues and emerging complaint clusters to help teams focus their response.',
    icon: <BellRing className="h-6 w-6" />,
  },
  {
    title: 'Operational analytics',
    description: 'Explore complaint trends, category breakdowns, neighborhood activity, and resolution metrics in one dashboard.',
    icon: <BarChart3 className="h-6 w-6" />,
  },
  {
    title: 'Sustainability-focused planning',
    description: 'Use civic feedback and service trends to support safer, cleaner, and more sustainable communities.',
    icon: <ShieldCheck className="h-6 w-6" />,
  },
];

function FeaturesPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-800">
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft">
              <img src={`${import.meta.env.BASE_URL}citycare-mark.svg`} alt="" className="h-10 w-10 rounded-xl" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">CityCare AI</div>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-700">Smarter Cities. Cleaner Tomorrow.</div>
            </div>
          </Link>
          <Link to="/" className="secondary-button gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            <Sparkles className="h-3.5 w-3.5" />
            CityCare features
          </div>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
            Tools for more responsive neighborhoods
          </h1>
          <p className="mt-5 text-lg text-slate-600">
            CityCare AI connects resident reports with practical tools for organizing issues, monitoring service activity, and understanding citywide trends.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon }) => (
            <article key={title} className="card p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                {icon}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-3 text-slate-600">{description}</p>
            </article>
          ))}
        </div>

      </main>
    </div>
  );
}

export default FeaturesPage;
