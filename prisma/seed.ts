import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rounds = [
  // ─── STANDARD POOL (early-game, foundational scenarios) ──────────────────────
  {
    orderIndex: 0,
    title: 'Delayed Order Frustration',
    scenario:
      '"I ordered this two weeks ago and it still hasn\'t arrived. No one told me it would take this long. I\'m really upset — I needed this for an important event!"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 1,
    title: 'Technical Support Burnout',
    scenario:
      '"I\'ve been on the phone for over an hour and transferred to three different people. I\'m tired of explaining the same issue again and again."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 2,
    title: 'Broken Item on Arrival',
    scenario:
      '"I just opened the box and the item is completely shattered. I needed this today — it was a gift. This is so disappointing."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 3,
    title: 'Missed Callback Promise',
    scenario:
      '"Someone told me I\'d get a call back yesterday. No one ever called. Why make promises you can\'t keep?"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 4,
    title: 'Account Locked Out',
    scenario:
      '"I can\'t get into my account and I\'ve been trying for 45 minutes. I have a meeting in an hour and I need this information. Can anyone actually help me?"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 5,
    title: 'Unexpected Fee Charged',
    scenario:
      '"I just got my statement and there\'s a $75 fee I did not authorize. I never agreed to this. I want it removed immediately."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 6,
    title: 'Long Wait Times',
    scenario:
      '"I\'ve been on hold for 40 minutes. Forty minutes! This is unacceptable. I have things to do — why is it this hard to get help?"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },
  {
    orderIndex: 7,
    title: 'Shipping to the Wrong Address',
    scenario:
      '"Why did you send this to my old address? I updated my info weeks ago. Now I don\'t even know where my package is."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'standard',
    difficulty: 'standard',
  },

  // ─── STANDARD BONUS POOL ─────────────────────────────────────────────────────
  {
    orderIndex: 8,
    title: 'Bonus — Make It Human (Repeat Contact)',
    scenario:
      '"I\'ve contacted your support team three times and still haven\'t received any help. This is really frustrating."',
    task: 'Rewrite the robotic response below to sound more empathetic and human.\nFocus on making the customer feel heard and valued.',
    isBonus: true,
    category: 'standard',
    difficulty: 'standard',
    roboticResponse:
      '"We are aware of your issue. Please be patient while we investigate. Your case will be handled in the order it was received."',
    facilitatorNote:
      'Reward any response that centers the customer\'s frustration, uses warm language, and commits to personal ownership.',
  },
  {
    orderIndex: 9,
    title: 'Bonus — Make It Human (On Hold Too Long)',
    scenario:
      '"I have been sitting on hold for over 30 minutes. I just need a simple answer. This is ridiculous."',
    task: 'Rewrite the robotic response below to sound more empathetic and human.\nFocus on making the customer feel heard and valued.',
    isBonus: true,
    category: 'standard',
    difficulty: 'standard',
    roboticResponse:
      '"Thank you for holding. We are experiencing high call volumes. Your estimated wait time is 15 minutes."',
    facilitatorNote:
      'Reward responses that acknowledge the wait with genuine empathy, not a re-read of the automated message.',
  },

  // ─── COMPLEX POOL (mid-game, nuanced or multi-layered scenarios) ──────────────
  {
    orderIndex: 10,
    title: 'Miscommunication on a Promotion',
    scenario:
      '"The ad said this would be 25% off, but now you\'re telling me I don\'t qualify? That\'s false advertising!"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
  },
  {
    orderIndex: 11,
    title: 'Accessibility Concern',
    scenario:
      '"Your app is really hard to use for someone with vision issues. I can barely read anything on it."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
  },
  {
    orderIndex: 12,
    title: 'Disrespected by a Previous Rep',
    scenario:
      '"The last person I talked to was really rude and dismissive. I don\'t even feel like a valued customer anymore."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
  },
  {
    orderIndex: 13,
    title: 'Bad Trade Fill — Brokerage',
    scenario:
      '"I do not understand how my fill could be this bad. This is why real traders use MooMoo or WeBull now."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nNote: Validate the frustration without admitting error — offer to review the fill details together.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
    facilitatorNote:
      'Reward responses that validate frustration without admitting fault, and that offer genuine investigation rather than deflection.',
  },
  {
    orderIndex: 14,
    title: 'Customer Wants to Cancel',
    scenario:
      '"I\'m done. I\'ve had three bad experiences in a row and I want to cancel my account. Nothing ever gets resolved here."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
  },
  {
    orderIndex: 15,
    title: 'Threatening to Post Online',
    scenario:
      '"If this doesn\'t get fixed today, I\'m posting about this on every review site and social media platform I can find."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nNote: Stay calm, don\'t escalate, focus on resolving — not defending.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
  },
  {
    orderIndex: 16,
    title: 'Asking for Investment Advice',
    scenario:
      '"Just tell me — should I sell or hold my position right now? You guys are the professionals. What would you do?"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nNote: You cannot give personalized investment advice. Focus on empathy, options available, and what you can offer.',
    isBonus: false,
    category: 'complex',
    difficulty: 'complex',
    facilitatorNote:
      'Reward responses that are warm and helpful while staying within compliance — not deflecting coldly.',
  },

  // ─── COMPLEX BONUS POOL ───────────────────────────────────────────────────────
  {
    orderIndex: 17,
    title: 'Bonus — Make It Human (Bad Fill)',
    scenario:
      '"I do not understand how my fill could be this bad. This is why real traders use MooMoo or WeBull now."',
    task: 'Rewrite the robotic response below to sound more empathetic and human.\nFocus on making the customer feel heard and valued.',
    isBonus: true,
    category: 'complex',
    difficulty: 'complex',
    roboticResponse:
      '"Your order was filled correctly. There is not much more to look into. We can get you a supervisor if you would like to go over the trades with them."',
    facilitatorNote:
      'Reward responses that validate the frustration without admitting error, and that offer genuine investigation rather than deflection.',
  },
  {
    orderIndex: 18,
    title: 'Bonus — Make It Human (Cancellation)',
    scenario:
      '"I\'ve tried everything and nothing works. I just want to cancel and be done with it."',
    task: 'Rewrite the robotic response below to sound more empathetic and human.\nFocus on making the customer feel heard and valued.',
    isBonus: true,
    category: 'complex',
    difficulty: 'complex',
    roboticResponse:
      '"We have received your cancellation request. Please allow 5–7 business days for processing. You will receive a confirmation email."',
    facilitatorNote:
      'Reward responses that acknowledge the frustration driving the cancellation, and that offer a genuine attempt to resolve before processing.',
  },

  // ─── DE-ESCALATION POOL (late-game, high-stakes scenarios) ───────────────────
  {
    orderIndex: 19,
    title: 'When the Customer Is Wrong',
    scenario:
      '"You said this was returnable, and now you\'re telling me I can\'t get my money back. That\'s completely unfair!"',
    task: 'Respond with empathy while still holding the policy line.\nKeep the tone warm and understanding.\n\nNote: The product was marked as final sale — the customer likely misunderstood the return policy.',
    isBonus: false,
    category: 'de-escalation',
    difficulty: 'de-escalation',
    facilitatorNote:
      'Reward responses that validate the customer\'s frustration without capitulating, and that hold the line without sounding harsh or defensive.',
  },
  {
    orderIndex: 20,
    title: 'Customer Lost Trust',
    scenario:
      '"I\'ve had issues before and I just don\'t believe anything you guys say anymore. You\'ll probably just ignore me again."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nFocus on rebuilding trust with specific language and a concrete commitment.',
    isBonus: false,
    category: 'de-escalation',
    difficulty: 'de-escalation',
    facilitatorNote:
      'Reward responses that rebuild trust through specific commitments, not just generic sympathy.',
  },
  {
    orderIndex: 21,
    title: 'Demanding a Manager',
    scenario:
      '"I want to speak to your manager right now. You\'re not helping me and I\'m sick of getting the runaround."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nNote: You\'re empowered to resolve this — try to de-escalate before escalating.',
    isBonus: false,
    category: 'de-escalation',
    difficulty: 'de-escalation',
    facilitatorNote:
      'Reward responses that take ownership rather than immediately passing the customer off, while still respecting their request.',
  },
  {
    orderIndex: 22,
    title: 'Disputing a Trade They Made',
    scenario:
      '"I placed this trade by accident and I want it reversed. This is your system\'s fault — it should have confirmed with me before executing."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nNote: Trade reversals are not guaranteed and require review. Stay empathetic but manage expectations.',
    isBonus: false,
    category: 'de-escalation',
    difficulty: 'de-escalation',
    facilitatorNote:
      'Reward responses that acknowledge the frustration without admitting liability, and that offer to investigate with genuine care.',
  },
  {
    orderIndex: 23,
    title: 'Threatening to Report to the SEC',
    scenario:
      '"If you don\'t fix this, I\'m going to file a complaint with the SEC and FINRA. I know my rights."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using the GOLD Standard.\n\nNote: Stay calm, never discourage regulatory filings, but focus on resolving the underlying concern.',
    isBonus: false,
    category: 'de-escalation',
    difficulty: 'de-escalation',
    facilitatorNote:
      'Reward calm, empathetic responses that take the concern seriously without matching the customer\'s energy or sounding defensive.',
  },

  // ─── DE-ESCALATION BONUS POOL ─────────────────────────────────────────────────
  {
    orderIndex: 24,
    title: 'Bonus — Rebuild Trust',
    scenario:
      '"I\'ve had issues before and I just don\'t believe anything you guys say anymore. You\'ll probably just ignore me again."',
    task: 'Rewrite this response to be more human, specific, and empathetic.\nMake it feel like you genuinely care and want to rebuild trust.',
    isBonus: true,
    category: 'de-escalation',
    difficulty: 'de-escalation',
    roboticResponse: '"We understand your frustration. We\'ll pass your feedback along."',
    facilitatorNote:
      'Focus scoring on responses that rebuild trust through specific commitments, not just generic sympathy.',
  },
];

async function main() {
  console.log('🌱 Seeding GOLD Standard rounds...');

  // Clear sessions first (cascades to sessionRounds/submissions), then rounds
  await prisma.session.deleteMany();
  await prisma.round.deleteMany();

  for (const round of rounds) {
    await prisma.round.create({ data: round });
  }

  console.log(`✅ Seeded ${rounds.length} rounds.`);
  console.log(`   Standard: ${rounds.filter((r) => r.category === 'standard' && !r.isBonus).length} rounds, ${rounds.filter((r) => r.category === 'standard' && r.isBonus).length} bonus`);
  console.log(`   Complex:  ${rounds.filter((r) => r.category === 'complex' && !r.isBonus).length} rounds, ${rounds.filter((r) => r.category === 'complex' && r.isBonus).length} bonus`);
  console.log(`   De-escal: ${rounds.filter((r) => r.category === 'de-escalation' && !r.isBonus).length} rounds, ${rounds.filter((r) => r.category === 'de-escalation' && r.isBonus).length} bonus`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
