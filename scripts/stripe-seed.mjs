const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_KEY) { console.error("Missing STRIPE_SECRET_KEY"); process.exit(1); }

async function stripePost(path, body) {
  const resp = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${STRIPE_KEY}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams(body).toString(),
  });
  const data = await resp.json();
  if (data.error) throw new Error(`${path}: ${data.error.message}`);
  return data;
}

async function stripeGet(path) {
  const resp = await fetch(`https://api.stripe.com/v1/${path}`, {
    headers: { Authorization: `Bearer ${STRIPE_KEY}` },
  });
  const data = await resp.json();
  return data;
}

async function main() {
  const plans = [
    { name: "SEOForge Creator", key: "HOBBY", mo: 29, yr: 23, trial: 1 },
    { name: "SEOForge Operator", key: "OPERATOR", mo: 79, yr: 63, trial: 10 },
    { name: "SEOForge Agency", key: "AGENCY", mo: 199, yr: 159, trial: 30 },
  ];

  const envVars = [];

  for (const plan of plans) {
    const product = await stripePost("products", {
      name: plan.name,
      "metadata[plan]": plan.key.toLowerCase(),
    });
    console.log(`Product: ${product.id} — ${plan.name}`);

    const moPrice = await stripePost("prices", {
      product: product.id,
      currency: "usd",
      unit_amount: plan.mo * 100,
      "recurring[interval]": "month",
      "metadata[plan]": plan.key.toLowerCase(),
      "metadata[cadence]": "monthly",
    });
    console.log(`  Monthly: ${moPrice.id} — $${plan.mo}/mo`);

    const yrPrice = await stripePost("prices", {
      product: product.id,
      currency: "usd",
      unit_amount: plan.yr * 100 * 12,
      "recurring[interval]": "year",
      "metadata[plan]": plan.key.toLowerCase(),
      "metadata[cadence]": "annual",
    });
    console.log(`  Annual: ${yrPrice.id} — $${plan.yr * 12}/yr`);

    const trialPrice = await stripePost("prices", {
      product: product.id,
      currency: "usd",
      unit_amount: plan.trial * 100,
      "metadata[plan]": plan.key.toLowerCase(),
      "metadata[type]": "trial",
    });
    console.log(`  Trial: ${trialPrice.id} — $${plan.trial}`);

    envVars.push(`STRIPE_PRICE_${plan.key}_MONTHLY=${moPrice.id}`);
    envVars.push(`STRIPE_PRICE_${plan.key}_ANNUAL=${yrPrice.id}`);
    envVars.push(`STRIPE_PRICE_${plan.key}_TRIAL=${trialPrice.id}`);
  }

  try {
    await stripePost("coupons", {
      id: "PH2026",
      name: "ProductHunt Launch",
      percent_off: 50,
      duration: "once",
      max_redemptions: 50,
    });
    console.log("\nCoupon: PH2026 (50% off, 50 max)");
  } catch (e) {
    console.log("\nCoupon: " + (e.message.includes("exists") ? "PH2026 already exists" : e.message));
  }

  console.log("\n=== SET THESE ON VERCEL ===");
  console.log(envVars.join("\n"));
}

main().catch(e => { console.error(e.message); process.exit(1); });
