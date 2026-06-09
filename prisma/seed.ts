import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const team: { name: string; email: string; role: Role; avatarUrl?: string }[] = [
  { name: "Luiz Garcez", email: "luizhenriquegarcez@gmail.com", role: "USER",  avatarUrl: "/avatars/luiz.jpg"    },
  { name: "Douglas",     email: "douglas@luizgarcez.com.br",    role: "USER",  avatarUrl: "/avatars/douglas.jpg" },
  { name: "Cleiton",     email: "cleiton@luizgarcez.com.br",    role: "USER",  avatarUrl: "/avatars/cleiton.jpg" },
  { name: "Kelly",       email: "kellyadrsz1@gmail.com",        role: "USER",  avatarUrl: "/avatars/kelly.jpg"   },
  { name: "Milenna",     email: "milenna@luizgarcez.com.br",    role: "USER",  avatarUrl: "/avatars/milenna.jpg" },
  { name: "Maria Eduarda",email: "garcez@garcez",               role: "ADMIN", avatarUrl: "/avatars/mariaeduarda.jpg" },
];

async function main() {
  const defaultPw = process.env.SEED_PASSWORD || "movimento2026";
  const hash = await bcrypt.hash(defaultPw, 10);

  for (const m of team) {
    await prisma.user.upsert({
      where:  { email: m.email },
      create: { email: m.email, name: m.name, role: m.role, passwordHash: hash, avatarUrl: m.avatarUrl },
      update: { name: m.name, role: m.role, ...(m.avatarUrl ? { avatarUrl: m.avatarUrl } : {}) }
    });
  }

  await prisma.challenge.upsert({
    where:  { id: "main" },
    create: {
      id: "main",
      name: "Movimento em Jogo",
      startDate: new Date("2026-06-08T00:00:00Z"),
      endDate:   new Date("2026-07-08T23:59:59Z"),
      bronzeKcal:       24000,
      silverKcal:       30000,
      goldKcal:         34000,
      bronzePoints:     300,
      silverPoints:     600,
      goldPoints:       900,
      bronzeActiveDays: 48,
      silverActiveDays: 72,
      goldActiveDays:   96,
      active: true
    },
    update: {
      startDate: new Date("2026-06-08T00:00:00Z"),
      endDate:   new Date("2026-07-08T23:59:59Z"),
      bronzeActiveDays: 48,
      silverActiveDays: 72,
      goldActiveDays:   96,
      active: true
    }
  });

  // ── Metas dos Setores ──
  await prisma.sectorGoal.upsert({
    where: { id: "comercial" },
    create: {
      id: "comercial",
      area: "Comercial",
      responsible: "Douglas",
      indicator: "Vendas de Sessão de Viabilidade por mês",
      current: 0,
      bronze: 5,   // a confirmar
      silver: 8,   // a confirmar
      gold: 12,    // a confirmar
      unit: "vendas",
      direction: "HIGHER_IS_BETTER"
    },
    update: {}
  });

  await prisma.sectorGoal.upsert({
    where: { id: "contabil" },
    create: {
      id: "contabil",
      area: "Operacional Contábil",
      responsible: "Cleiton",
      indicator: "Prazo de entrega da holding",
      current: 0,
      bronze: 12,  // até 12 meses
      silver: 9,   // até 9 meses
      gold: 6,     // até 6 meses
      unit: "meses",
      direction: "LOWER_IS_BETTER"
    },
    update: {}
  });

  await prisma.sectorGoal.upsert({
    where: { id: "operacional" },
    create: {
      id: "operacional",
      area: "Operacional",
      responsible: "Kelly",
      indicator: "Tempo de organização de pastas",
      current: 0,
      bronze: 120, // até 2h (120 min)
      silver: 75,  // até 1h15 (75 min)
      gold: 40,    // até 40 min
      unit: "min",
      direction: "LOWER_IS_BETTER"
    },
    update: {}
  });

  await prisma.sectorGoal.upsert({
    where: { id: "atendimento" },
    create: {
      id: "atendimento",
      area: "Atendimento",
      responsible: "Milenna",
      indicator: "CSAT",
      current: 0,
      bronze: 4.0,
      silver: 4.5,
      gold: 5.0,
      unit: "pts",
      direction: "HIGHER_IS_BETTER"
    },
    update: {}
  });

  console.log(`Seed OK. Senha padrão: ${defaultPw}`);
}

main().finally(() => prisma.$disconnect());
