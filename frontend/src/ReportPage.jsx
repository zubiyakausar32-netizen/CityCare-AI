import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight, ShieldCheck, Sparkles, Upload } from 'lucide-react';

const categories = [
  'Waste Management',
  'Road Damage',
  'Water and Drainage',
  'Street Lighting',
  'Air Quality',
];

const priorities = ['Low', 'Medium', 'High', 'Critical'];

const defaultForm = {
  title: '',
  description: '',
  issue_category: 'Waste Management',
  location: '',
  priority: 'Medium',
};

function ReportPage() {
  const [form, setForm] = useState(defaultForm);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setSubmissionResult(null);

    try {
      const complaintData = form;
      const response = await fetch('/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });
      const text = await response.text();

      if (!text.trim()) {
        throw new Error('Backend returned an empty response. Check the API server.');
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (error) {
        console.error('Invalid JSON response:', text);
        throw new Error('Backend returned invalid JSON.');
      }

      if (!response.ok) {
        throw new Error(result.message || result.error || 'Request failed.');
      }

      console.log('Prediction result:', result);

      const submissionResponse = await fetch('/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(complaintData),
      });
      const submissionText = await submissionResponse.text();

      if (!submissionText.trim()) {
        throw new Error('Backend returned an empty response while saving the complaint.');
      }

      let submission;
      try {
        submission = JSON.parse(submissionText);
      } catch (error) {
        console.error('Invalid complaint response:', submissionText);
        throw new Error('Backend returned invalid JSON while saving the complaint.');
      }

      if (!submissionResponse.ok) {
        throw new Error(submission.message || submission.error || 'Unable to submit complaint.');
      }

      setSubmissionResult({
        ...submission,
        prediction: result.prediction,
      });
      setForm(defaultForm);
    } catch (error) {
      setSubmissionResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="border-b border-white/10 bg-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-soft">
              <img src="/citycare-mark.svg" alt="" className="h-10 w-10 rounded-xl" />
            </div>
            <div>
              <div className="text-lg font-bold">CityCare AI</div>
              <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Smarter Cities. Cleaner Tomorrow.</div>
            </div>
          </Link>
          <Link to="/" className="secondary-button gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-300">Complaint reporting</div>
          <h1 className="mt-4 text-3xl font-bold">AI-powered complaint submission</h1>
          <p className="mt-3 text-slate-300">Describe the issue and our AI will help classify it for the service team.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white p-6 text-slate-800 shadow-soft">
            <div className="grid gap-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Complaint title</span>
                <input className="form-field" name="title" value={form.title} onChange={handleChange} placeholder="Overflowing garbage near bus stop" required />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-medium text-slate-700">Detailed description</span>
                <textarea className="form-field min-h-[120px] resize-none" name="description" value={form.description} onChange={handleChange} placeholder="Describe the issue in detail" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Issue category</span>
                <select className="form-field" name="issue_category" value={form.issue_category} onChange={handleChange}>
                  {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Location or neighborhood</span>
                <input className="form-field" name="location" value={form.location} onChange={handleChange} placeholder="Nairobi Central" required />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Priority</span>
                <select className="form-field" name="priority" value={form.priority} onChange={handleChange}>
                  {priorities.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-700">Optional image upload</span>
                <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  <Upload className="h-4 w-4" />
                  Upload photo (demo)
                </div>
              </label>
            </div>

            <button type="submit" disabled={loading} className="primary-button mt-6 w-full gap-2">
              {loading ? 'Classifying complaint...' : 'Submit complaint'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </form>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold">Prediction result</h2>
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
            </div>

            {submissionResult ? (
              <div className="space-y-4">
                {submissionResult.error ? (
                  <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200">
                    {submissionResult.error}
                  </div>
                ) : (
                  <>
                    <div className="rounded-2xl bg-white/10 p-4 text-sm">
                      <div className="text-emerald-200">Complaint reference</div>
                      <div className="mt-2 text-2xl font-black">{submissionResult.complaint.reference_id}</div>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Predicted category</div>
                        <div className="mt-2 text-lg font-bold">{submissionResult.prediction.predicted_category}</div>
                      </div>
                      <div className="rounded-2xl bg-white/5 p-4">
                        <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Model confidence</div>
                        <div className="mt-2 text-lg font-bold">{Number(submissionResult.prediction.confidence * 100).toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-[0.18em] text-emerald-200">Selected category</div>
                      <div className="mt-2 text-lg font-bold">{form.issue_category || submissionResult.complaint.issue_category}</div>
                    </div>
                    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                      Recommended next action: <span className="font-semibold">Dispatch sanitation or civic team for {submissionResult.prediction.predicted_category.toLowerCase()}.</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-white/5 p-5 text-sm text-emerald-100">
                Submit a complaint to see a model prediction, confidence score, and recommended action.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ReportPage;
