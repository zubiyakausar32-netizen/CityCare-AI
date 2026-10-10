import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Sparkles } from 'lucide-react';

const topics = {
  'civic-participation': {
    title: 'Improved civic participation and transparency',
    description: 'Inclusive, transparent city services start with residents having a clear way to share local concerns and see how those concerns are handled.',
    actions: [
      ['Make reporting accessible', 'Let residents submit clear descriptions and locations for issues affecting their neighborhoods.'],
      ['Keep service progress visible', 'Track reports through review, work in progress, and resolution so communities can understand what is happening.'],
    ],
  },
  'infrastructure-maintenance': {
    title: 'More efficient infrastructure maintenance',
    description: 'Timely reports about damaged roads, drainage problems, and other infrastructure issues help city teams identify maintenance needs and plan responses.',
    actions: [
      ['Identify maintenance needs', 'Collect issue details and locations to help teams understand where infrastructure needs attention.'],
      ['Plan service responses', 'Use complaint priorities and status tracking to organize work and follow issues through resolution.'],
    ],
  },
  'municipal-prioritization': {
    title: 'Data-driven municipal prioritization',
    description: 'Complaint trends can help city teams understand which issues and neighborhoods need attention, supporting more informed use of public resources.',
    actions: [
      ['Understand citywide trends', 'Review reports by category, priority, location, and time to identify recurring service needs.'],
      ['Focus resources where needed', 'Use the patterns in resident reports to guide planning and coordinate municipal responses.'],
    ],
  },
};

function SdgTopicPage() {
  const { topic } = useParams();
  const content = topics[topic];

  if (!content) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">SDG 11 topic not found</h1>
        <Link to="/sdg-11" className="secondary-button mt-6">Back to SDG 11</Link>
      </main>
    );
  }

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
          <Link to="/sdg-11" className="secondary-button gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to SDG 11
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <article className="card p-8 sm:p-12">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <Sparkles className="h-7 w-7" />
          </div>
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Sustainable Development Goal 11</div>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">{content.title}</h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">{content.description}</p>

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {content.actions.map(([title, description]) => (
              <section key={title} className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <h2 className="font-bold text-slate-900">{title}</h2>
                <p className="mt-2 text-slate-600">{description}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}

export default SdgTopicPage;
