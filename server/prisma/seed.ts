import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const PASSWORD_HASH = await bcrypt.hash("password123", 10);

const researcherData = [
  {
    email: "evelyn.reed@curalink.com",
    specialties: ["Pediatric Oncology", "Immunology"],
    interests: ["CAR T-Cell Therapy", "Solid Tumors", "AI Diagnostics"],
    availableForMeeting: true,
  },
  {
    email: "marcus.bell@curalink.com",
    specialties: ["Neurology", "Cognitive Science"],
    interests: ["Clinical AI", "Neuroimaging", "Parkinson Research"],
    availableForMeeting: true,
  },
  {
    email: "priya.sharma@curalink.com",
    specialties: ["Cardiology", "Vascular Medicine"],
    interests: ["Gene Therapy", "Stem Cell Repair", "Remote Monitoring"],
    availableForMeeting: false,
  },
];

async function main() {
  console.log(`\n🤖 Starting database seed...`);

  // 1. --- Create Seed Researcher Users ---
  for (const r of researcherData) {
    const researcher = await prisma.user.create({
      data: {
        email: r.email,
        password: PASSWORD_HASH,
        role: UserRole.RESEARCHER,
        researcherProfile: {
          create: {
            specialties: r.specialties,
            researchInterests: r.interests,
            availableForMeeting: r.availableForMeeting,
          },
        },
      },
    });
    console.log(`✅ Created Researcher: ${researcher.email}`);
  }

  // 2. --- Create Seed Patient Users ---
  const patient1 = await prisma.user.create({
    data: {
      email: "patient.one@curalink.com",
      password: PASSWORD_HASH,
      role: UserRole.PATIENT,
      patientProfile: {
        create: {
          conditions: ["Glioma", "Brain Cancer"],
          location: "New York, USA",
        },
      },
    },
  });
  console.log(`✅ Created Patient: ${patient1.email}`);

  const patient2 = await prisma.user.create({
    data: {
      email: "patient.two@curalink.com",
      password: PASSWORD_HASH,
      role: UserRole.PATIENT,
      patientProfile: {
        create: {
          conditions: ["Lung Cancer"],
          location: "Boston, USA",
        },
      },
    },
  });
  console.log(`✅ Created Patient: ${patient2.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log(`\n🎉 Database seeding complete.`);
  });
