import { ok, handleRouteError } from "@/lib/api";

// keyword-matched replies. swap answer() for an LLM call later.
const KB: { match: RegExp; reply: string }[] = [
  {
    match: /maize|corn/i,
    reply:
      "Maize does best in well-drained loam with a soil pH of 5.5 to 7.0. Plant at the onset of reliable rains, 75cm between rows and 25 to 30cm within the row. Top-dress with CAN when the crop is knee-high. Watch for fall armyworm in the first 6 weeks.",
  },
  {
    match: /tomato/i,
    reply:
      "Tomatoes need full sun and staking. Space 60cm x 45cm, mulch to keep moisture even (uneven watering causes blossom-end rot), and scout weekly for blight and whitefly. Rotate away from other nightshades for 2 to 3 seasons.",
  },
  {
    match: /dairy|cow|milk/i,
    reply:
      "For dairy cows, aim for a balanced ration of forage plus 1kg concentrate per 2 to 2.5 litres of milk produced. Provide clean water at all times, keep a calving and service calendar, and book a vet for routine reproductive checks from the Services page.",
  },
  {
    match: /poultry|chicken|layer|broiler/i,
    reply:
      "Layers start producing around 18 to 20 weeks. Give 16 to 18 hours of light and 110 to 120g of layer mash per bird per day. Vaccinate for Newcastle and Gumboro on schedule, and keep litter dry to prevent coccidiosis.",
  },
  {
    match: /fertiliz|manure|npk|soil/i,
    reply:
      "Start with a soil test so you apply only what's missing. As a rule of thumb: phosphorus (DAP/TSP) at planting for root establishment, nitrogen (CAN/urea) as a top-dress during vegetative growth. Well-composted manure improves soil structure and water holding over time.",
  },
  {
    match: /pest|aphid|armyworm|disease|fungus|blight/i,
    reply:
      "Identify the pest before spraying. Use the economic threshold: treat only when damage justifies it. Rotate chemical groups to slow resistance, observe pre-harvest intervals, and combine with cultural controls (field hygiene, resistant varieties, rotation).",
  },
  {
    match: /price|market|sell|buy/i,
    reply:
      "You can list produce, livestock and equipment on the Market page and browse what other farmers are offering. Set your price in KES and add a clear photo and location. Listings with photos get far more interest.",
  },
  {
    match: /record|track|manage|analytics/i,
    reply:
      "Keep a simple record every time money or inputs move: date, item, quantity, cost or income, and the field or animal it relates to. Over a season that history tells you your real cost of production per crop, and the Dashboard rolls it up for you.",
  },
];

function answer(question: string): string {
  const hit = KB.find((k) => k.match.test(question));
  if (hit) return hit.reply;
  return "I can help with crops (maize, tomatoes), livestock (dairy, poultry), soil and fertiliser, pest management, using the Market, and farm record-keeping. Try asking something like \"How do I space maize?\" or \"What ration for a dairy cow?\"";
}

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };
    const text = (message ?? "").trim();
    if (!text) return ok({ reply: "Ask me a farming question to get started." });
    return ok({ reply: answer(text) });
  } catch (err) {
    return handleRouteError(err);
  }
}
