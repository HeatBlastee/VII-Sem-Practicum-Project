import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.checkIn.deleteMany();
  await prisma.moodLog.deleteMany();
  await prisma.reminder.deleteMany();
  await prisma.caregiverLink.deleteMany();
  await prisma.elder.deleteMany();
  await prisma.caregiver.deleteMany();

  const caregiver = await prisma.caregiver.create({
    data: { name: "Anita Shah", email: "mann42006@gmail.com" },
  });

  const elder = await prisma.elder.create({
    data: {
      name: "Rameshbhai Shah",
      phone: "+91-9800000000",
      avatarColor: "#5B8DEF",
      caregivers: { create: { caregiverId: caregiver.id, relation: "Daughter" } },
    },
  });

  const elder2 = await prisma.elder.create({
    data: {
      name: "Kamlaben Shah",
      phone: "+91-9800000001",
      avatarColor: "#E4864E",
      caregivers: { create: { caregiverId: caregiver.id, relation: "Mother-in-law" } },
    },
  });

  const reminders = await Promise.all([
    prisma.reminder.create({
      data: {
        elderId: elder.id,
        type: "MEDICINE",
        label: "Blood Pressure Tablet",
        time: "08:00",
        question: "Did you take your Blood Pressure medicine?",
      },
    }),
    prisma.reminder.create({
      data: {
        elderId: elder.id,
        type: "MEAL",
        label: "Lunch",
        time: "13:00",
        question: "Have you had your lunch?",
      },
    }),
    prisma.reminder.create({
      data: {
        elderId: elder.id,
        type: "SLEEP",
        label: "Bedtime",
        time: "22:00",
        question: "Are you getting ready for bed?",
      },
    }),
    prisma.reminder.create({
      data: {
        elderId: elder2.id,
        type: "MEDICINE",
        label: "Diabetes Tablet",
        time: "09:00",
        question: "Did you take your Diabetes medicine?",
      },
    }),
  ]);

  const now = new Date();
  const statuses = ["DONE_ON_TIME", "DONE_LATE", "MISSED", "DONE_ON_TIME", "PENDING"];

  for (const reminder of reminders) {
    for (let i = 0; i < 6; i++) {
      const day = new Date(now);
      day.setDate(day.getDate() - i);
      const status = i === 0 ? "PENDING" : statuses[i % statuses.length];
      await prisma.checkIn.create({
        data: {
          elderId: reminder.elderId,
          reminderId: reminder.id,
          scheduledFor: day,
          status,
          respondedAt: status === "PENDING" ? null : day,
          response: status.startsWith("DONE") ? "yes" : status === "MISSED" ? null : "no",
        },
      });
    }
  }

  await prisma.moodLog.createMany({
    data: [
      { elderId: elder.id, mood: "great", note: "Feeling good today" },
      { elderId: elder.id, mood: "okay" },
      { elderId: elder2.id, mood: "okay", note: "Slept late" },
    ],
  });

  console.log("Seeded:", { caregiver: caregiver.email, elders: [elder.name, elder2.name] });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
