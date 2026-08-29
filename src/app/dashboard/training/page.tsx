export const metadata = { title: "Training" };

const COURSES = [
  {
    title: "Soil health & testing",
    length: "3 modules - ~45 min",
    body: "Read a soil test, correct pH, and build organic matter over time.",
  },
  {
    title: "Integrated pest management",
    length: "4 modules - ~1 hr",
    body: "Scout, identify, use economic thresholds, and rotate chemistry safely.",
  },
  {
    title: "Dairy herd basics",
    length: "5 modules - ~1.5 hr",
    body: "Rations, body condition scoring, and a working calving calendar.",
  },
  {
    title: "Post-harvest handling",
    length: "3 modules - ~40 min",
    body: "Cut losses between the field and the market with better drying and storage.",
  },
  {
    title: "Farm record-keeping",
    length: "2 modules - ~30 min",
    body: "Track inputs and income so you know your real cost of production.",
  },
];

export default function TrainingPage() {
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-farm-700">Training</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Short, practical courses. Enrolment opens each term.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {COURSES.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-farm-100 bg-white p-5 shadow-sm"
          >
            <h2 className="font-semibold text-farm-700">{c.title}</h2>
            <p className="mt-1 text-xs text-neutral-400">{c.length}</p>
            <p className="mt-2 text-sm text-neutral-600">{c.body}</p>
            <button
              className="mt-3 rounded-md border border-farm-300 px-3 py-1.5 text-sm font-medium text-farm-700 hover:bg-farm-50"
              disabled
            >
              Notify me
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
