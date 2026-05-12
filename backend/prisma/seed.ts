/**
 * prisma/seed.ts — Seed the database with realistic demo data.
 *
 * Creates:
 * - 4 users (1 ADMIN, 1 PC_CHAIR, 1 REVIEWER, 1 AUTHOR)
 * - 5 conferences with varied statuses
 * - 2-3 tracks per conference
 * - 3 paper submissions (DRAFT, SUBMITTED, UNDER_REVIEW)
 * - 2 reviews (PENDING, COMPLETED)
 *
 * Run: npm run db:seed
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const SALT_ROUNDS = 12;

async function main() {
  console.log('🌱 Seeding database...');

  // ── Clean existing data ────────────────────────────────────────────────────
  await prisma.review.deleteMany();
  await prisma.authorship.deleteMany();
  await prisma.paperSubmission.deleteMany();
  await prisma.track.deleteMany();
  await prisma.conference.deleteMany();
  await prisma.user.deleteMany();

  console.log('  ✓ Cleared existing data');

  // ── Users ──────────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Password123!', SALT_ROUNDS);

  const admin = await prisma.user.create({
    data: {
      firstName: 'Admin',
      lastName: 'System',
      email: 'admin@academicconf.io',
      passwordHash,
      academicAffiliation: 'AcademicConf Platform',
      country: 'Morocco',
      role: 'ADMIN',
      biography: 'Platform administrator.',
    },
  });

  const pcChair = await prisma.user.create({
    data: {
      firstName: 'Fatima',
      lastName: 'Benali',
      email: 'fatima.benali@um5.ac.ma',
      passwordHash,
      academicAffiliation: 'Université Mohammed V de Rabat',
      country: 'Morocco',
      role: 'PC_CHAIR',
      biography: 'Professor of Computer Science and program committee chair.',
      metaLink: 'https://scholar.google.com/fatima.benali',
    },
  });

  const reviewer = await prisma.user.create({
    data: {
      firstName: 'Youssef',
      lastName: 'El Mansouri',
      email: 'y.elmansouri@uca.ac.ma',
      passwordHash,
      academicAffiliation: 'Université Cadi Ayyad, Marrakech',
      country: 'Morocco',
      role: 'REVIEWER',
      biography: 'Researcher in Machine Learning and NLP.',
      metaLink: 'https://scholar.google.com/y.elmansouri',
    },
  });

  const author = await prisma.user.create({
    data: {
      firstName: 'Amine',
      lastName: 'Tazi',
      email: 'amine.tazi@student.ensa.ma',
      passwordHash,
      academicAffiliation: 'ENSA Casablanca',
      country: 'Morocco',
      role: 'AUTHOR',
      biography: 'PhD student in Distributed Systems.',
    },
  });

  console.log('  ✓ Created 4 users');
  console.log('    ↳ admin@academicconf.io (ADMIN)');
  console.log('    ↳ fatima.benali@um5.ac.ma (PC_CHAIR)');
  console.log('    ↳ y.elmansouri@uca.ac.ma (REVIEWER)');
  console.log('    ↳ amine.tazi@student.ensa.ma (AUTHOR)');
  console.log('    ↳ Password for all: Password123!');

  // ── Conferences ────────────────────────────────────────────────────────────
  const conf1 = await prisma.conference.create({
    data: {
      name: 'ICAI 2026 — International Conference on Artificial Intelligence',
      location: 'Casablanca, Morocco',
      startDate: new Date('2026-09-15'),
      endDate: new Date('2026-09-18'),
      submissionDeadline: new Date('2026-06-01'),
      status: 'OPEN',
      description:
        'ICAI 2026 brings together researchers and practitioners from around the world to present the latest advances in Artificial Intelligence, Machine Learning, and Deep Learning.',
    },
  });

  const conf2 = await prisma.conference.create({
    data: {
      name: 'CCSW 2026 — Cloud Computing & Security Workshop',
      location: 'Rabat, Morocco',
      startDate: new Date('2026-10-05'),
      endDate: new Date('2026-10-07'),
      submissionDeadline: new Date('2026-07-15'),
      status: 'UPCOMING',
      description:
        'CCSW is the premier venue for research in cloud computing security, privacy, and resilience.',
    },
  });

  const conf3 = await prisma.conference.create({
    data: {
      name: 'ICDS 2026 — International Conference on Data Science',
      location: 'Marrakech, Morocco',
      startDate: new Date('2026-11-20'),
      endDate: new Date('2026-11-22'),
      submissionDeadline: new Date('2026-08-30'),
      status: 'UPCOMING',
      description:
        'ICDS focuses on data science methodologies, big data analytics, and their real-world applications.',
    },
  });

  const conf4 = await prisma.conference.create({
    data: {
      name: 'NETCOM 2025 — Network Communication Symposium',
      location: 'Fès, Morocco',
      startDate: new Date('2025-11-10'),
      endDate: new Date('2025-11-12'),
      submissionDeadline: new Date('2025-08-01'),
      status: 'CLOSED',
      description: 'Annual symposium on network communications, protocols, and IoT.',
    },
  });

  const conf5 = await prisma.conference.create({
    data: {
      name: 'SECRYPT 2025 — International Conference on Security and Cryptography',
      location: 'Agadir, Morocco',
      startDate: new Date('2025-07-08'),
      endDate: new Date('2025-07-10'),
      submissionDeadline: new Date('2025-04-01'),
      status: 'ARCHIVED',
      description:
        'SECRYPT 2025 covered applied cryptography, blockchain security, and privacy-enhancing technologies.',
    },
  });

  console.log('  ✓ Created 5 conferences');

  // ── Tracks ─────────────────────────────────────────────────────────────────
  const [track1a, track1b, track1c] = await Promise.all([
    prisma.track.create({ data: { name: 'Machine Learning & Deep Learning', conferenceId: conf1.id } }),
    prisma.track.create({ data: { name: 'Natural Language Processing', conferenceId: conf1.id } }),
    prisma.track.create({ data: { name: 'Computer Vision & Robotics', conferenceId: conf1.id } }),
  ]);

  const [track2a, track2b] = await Promise.all([
    prisma.track.create({ data: { name: 'Cloud Security & Privacy', conferenceId: conf2.id } }),
    prisma.track.create({ data: { name: 'Zero-Trust Architectures', conferenceId: conf2.id } }),
  ]);

  await Promise.all([
    prisma.track.create({ data: { name: 'Big Data Analytics', conferenceId: conf3.id } }),
    prisma.track.create({ data: { name: 'Data Visualization', conferenceId: conf3.id } }),
    prisma.track.create({ data: { name: 'Data Engineering & Pipelines', conferenceId: conf3.id } }),
  ]);

  await Promise.all([
    prisma.track.create({ data: { name: '5G & Beyond', conferenceId: conf4.id } }),
    prisma.track.create({ data: { name: 'IoT Protocols', conferenceId: conf4.id } }),
  ]);

  await Promise.all([
    prisma.track.create({ data: { name: 'Applied Cryptography', conferenceId: conf5.id } }),
    prisma.track.create({ data: { name: 'Blockchain Security', conferenceId: conf5.id } }),
  ]);

  console.log('  ✓ Created tracks for all 5 conferences');

  // ── Paper Submissions ──────────────────────────────────────────────────────
  const paper1 = await prisma.paperSubmission.create({
    data: {
      title: 'Federated Learning for Privacy-Preserving Medical Diagnosis',
      abstract:
        'This paper presents a novel federated learning framework designed to enable collaborative model training across multiple medical institutions without sharing sensitive patient data. Our approach introduces a differential privacy mechanism combined with secure aggregation to ensure strong privacy guarantees while maintaining high diagnostic accuracy across diverse medical imaging tasks.',
      status: 'UNDER_REVIEW',
      trackId: track1a.id,
      authorships: {
        create: [
          { userId: author.id, authorSequenceOrder: 1, isCorrespondingAuthor: true },
          { userId: reviewer.id, authorSequenceOrder: 2, isCorrespondingAuthor: false },
        ],
      },
    },
  });

  const paper2 = await prisma.paperSubmission.create({
    data: {
      title: 'Transformer-Based Arabic Named Entity Recognition with Low-Resource Adaptation',
      abstract:
        'We propose an adapted pre-trained transformer model fine-tuned for Arabic Named Entity Recognition (NER) in low-resource settings. By leveraging cross-lingual transfer and domain-specific augmentation strategies, our model achieves state-of-the-art performance on the ANERcorp and AQMAR datasets. Experimental results demonstrate a significant improvement over baseline models, particularly in handling dialectal Arabic.',
      status: 'SUBMITTED',
      trackId: track1b.id,
      authorships: {
        create: [
          { userId: author.id, authorSequenceOrder: 1, isCorrespondingAuthor: true },
        ],
      },
    },
  });

  const paper3 = await prisma.paperSubmission.create({
    data: {
      title: 'Zero-Knowledge Proof Schemes for Verifiable Cloud Storage Auditing',
      abstract:
        'Cloud storage auditing allows users to verify data integrity without downloading files. This paper introduces an efficient zero-knowledge proof scheme that enables public verifiability, data dynamics, and batch auditing simultaneously. Our construction reduces communication overhead by 40% compared to prior work while maintaining security under the standard DL assumption.',
      status: 'DRAFT',
      trackId: track2a.id,
      authorships: {
        create: [
          { userId: pcChair.id, authorSequenceOrder: 1, isCorrespondingAuthor: true },
          { userId: author.id, authorSequenceOrder: 2, isCorrespondingAuthor: false },
        ],
      },
    },
  });

  console.log('  ✓ Created 3 paper submissions');

  // ── Reviews ────────────────────────────────────────────────────────────────
  await prisma.review.create({
    data: {
      paperId: paper1.id,
      reviewerId: reviewer.id,
      comments:
        'The paper presents a well-structured federated learning approach. The differential privacy mechanism is clearly explained and the experiments on medical imaging are convincing. Minor concerns about scalability with heterogeneous data.',
      evaluationComments:
        'Strong contribution to privacy-preserving ML. Recommend acceptance with minor revisions regarding the scalability experiments.',
      status: 'COMPLETED',
    },
  });

  await prisma.review.create({
    data: {
      paperId: paper2.id,
      reviewerId: reviewer.id,
      comments: '',
      evaluationComments: '',
      status: 'PENDING',
    },
  });

  console.log('  ✓ Created 2 reviews (1 COMPLETED, 1 PENDING)');
  console.log('');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('📋 Test credentials:');
  console.log('   Email: amine.tazi@student.ensa.ma');
  console.log('   Password: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
