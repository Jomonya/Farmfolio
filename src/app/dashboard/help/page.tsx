export const metadata = { title: "Help" };

const FAQ = [
  {
    q: "How do I list a product?",
    a: "Go to the Market page, click 'Add a product', fill in the details and an image URL, then submit. It appears immediately and shows up under My Inventory.",
  },
  {
    q: "How do I book a vet?",
    a: "Open the Services page, pick a veterinarian, choose a date and time, and submit. The booking shows on your dashboard with its status.",
  },
  {
    q: "Is my data shared with other farmers?",
    a: "Your listings and their location are public in the market. Your bookings, notebooks and analytics are private to your account.",
  },
  {
    q: "What is Ask Hodari?",
    a: "A quick assistant for general farming questions. It is guidance only. For anything serious, book an expert from the Services page.",
  },
];

export default function HelpPage() {
  return (
    <div className="mt-4">
      <h1 className="text-2xl font-bold text-farm-700">Help & FAQ</h1>

      <div className="mt-6 space-y-3">
        {FAQ.map((item) => (
          <details
            key={item.q}
            className="rounded-xl border border-farm-100 bg-white p-4 shadow-sm"
          >
            <summary className="cursor-pointer font-medium text-farm-700">
              {item.q}
            </summary>
            <p className="mt-2 text-sm text-neutral-600">{item.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-farm-100 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-farm-700">Contact us</h2>
        <p className="mt-2 text-sm text-neutral-600">
          Email{" "}
          <a
            href="mailto:support@farmfolio.app"
            className="text-farm-600 hover:underline"
          >
            support@farmfolio.app
          </a>
          {". "}
          We usually reply within one working day.
        </p>
      </div>
    </div>
  );
}
