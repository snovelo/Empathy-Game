import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const rounds = [
  {
    orderIndex: 0,
    title: 'Round 1 — Delayed Order Frustration',
    scenario:
      '"I ordered this two weeks ago and it still hasn\'t arrived. No one told me it would take this long. I\'m really upset—I needed this for an important event!"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 1,
    title: 'Round 2 — Technical Support Burnout',
    scenario:
      '"I\'ve been on the phone for over an hour and transferred to three different people. I\'m tired of explaining the same issue again and again."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 2,
    title: 'Bonus Round 1 — Make It Human',
    scenario:
      '"I\'ve contacted your support team three times and still haven\'t received any help. This is really frustrating."',
    task: 'Rewrite the robotic response below to sound more empathetic and human.\nFocus on making the customer feel heard and valued.',
    isBonus: true,
    roboticResponse:
      '"We are aware of your issue. Please be patient while we investigate. Your case will be handled in the order it was received."',
    facilitatorNote:
      'Participants should rewrite the robotic response. Reward any response that centers the customer\'s frustration, uses warm language, and commits to personal ownership.',
  },
  {
    orderIndex: 3,
    title: 'Round 3 — Shipping to the Wrong Address',
    scenario:
      '"Why did you send this to my old address? I updated my info weeks ago. Now I don\'t even know where my package is."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 4,
    title: 'Round 4 — Broken Item on Arrival',
    scenario:
      '"I just opened the box and the item is completely shattered. I needed this today—it was a gift. This is so disappointing."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 5,
    title: 'Bonus Round 2 — Make It Human (Brokerage)',
    scenario:
      '"I do not understand how my fill could be this bad. This is why real traders use MooMoo or WeBull now."',
    task: 'Rewrite the robotic response below to sound more empathetic and human.\nFocus on making the customer feel heard and valued.',
    isBonus: true,
    roboticResponse:
      '"Your order was filled correctly. There is not much more to look into. We can get you a supervisor if you would like to go over the trades with them."',
    facilitatorNote:
      'This scenario is brokerage-specific. Reward responses that validate the frustration without admitting error, and that offer genuine investigation rather than deflection.',
  },
  {
    orderIndex: 6,
    title: 'Round 5 — Miscommunication on Promotion',
    scenario:
      '"The ad said this would be 25% off, but now you\'re telling me I don\'t qualify? That\'s false advertising!"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 7,
    title: 'Round 6 — Accessibility Concern',
    scenario:
      '"Your app is really hard to use for someone with vision issues. I can barely read anything on it."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 8,
    title: 'Round 7 — Missed Callback Promise',
    scenario:
      '"Someone told me I\'d get a call back yesterday. No one ever called. Why make promises you can\'t keep?"',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 9,
    title: 'Round 8 — Disrespected by Previous Rep',
    scenario:
      '"The last person I talked to was really rude and dismissive. I don\'t even feel like a valued customer anymore."',
    task: 'How would you respond to this customer?\nWrite your response in 2–4 sentences using an empathetic tone.',
    isBonus: false,
  },
  {
    orderIndex: 10,
    title: 'Bonus Round 3 — Make This Response Better',
    scenario:
      '"I\'ve had issues before and I just don\'t believe anything you guys say anymore. You\'ll probably just ignore me again."',
    task: 'Rewrite this response to be more human, specific, and empathetic.\nMake it feel like you genuinely care and want to rebuild trust.',
    isBonus: true,
    roboticResponse: '"We understand your frustration. We\'ll pass your feedback along."',
    facilitatorNote:
      'Focus scoring on responses that rebuild trust through specific commitments, not just generic sympathy.',
  },
  {
    orderIndex: 11,
    title: 'Round 9 — When the Customer Is Wrong',
    scenario:
      '"You said this was returnable, and now you\'re telling me I can\'t get my money back. That\'s completely unfair!"',
    task: 'Respond with empathy while still holding the policy line.\nKeep the tone warm and understanding.\n\nNote: The product was marked as final sale — the customer likely misunderstood the return policy.',
    isBonus: false,
    facilitatorNote:
      'Scoring should reward responses that validate the customer\'s frustration without capitulating, and that hold the line without sounding harsh or defensive.',
  },
];

async function main() {
  console.log('🌱 Seeding rounds...');

  // Clear existing rounds
  await prisma.round.deleteMany();

  for (const round of rounds) {
    await prisma.round.create({ data: round });
  }

  console.log(`✅ Seeded ${rounds.length} rounds.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
