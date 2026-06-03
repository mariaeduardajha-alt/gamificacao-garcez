import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const BASE = process.env.BASE_URL || "http://localhost:3003";
const ROOT = dirname(fileURLToPath(import.meta.url));
const SHOTS = join(ROOT, "screenshots");
mkdirSync(SHOTS, { recursive: true });

const ADMIN = { email: "garcez@garcez.com", password: "movimento2026" };
const NEW_USER = {
  name: "Agente Teste",
  email: `teste+${Date.now()}@garcez.com`,
  sector: "QA",
  password: "teste123456"
};

const results = [];
function step(name, ok, detail = "") {
  results.push({ name, ok, detail });
  const icon = ok ? "PASS" : "FAIL";
  console.log(`[${icon}] ${name}${detail ? " — " + detail : ""}`);
}

async function shot(page, name) {
  await page.screenshot({ path: join(SHOTS, `${name}.png`), fullPage: true });
}

// Cria um arquivo PNG 1x1 pra usar como "print" no upload
const PNG_1x1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==",
  "base64"
);
const TMP_IMG = join(ROOT, "fake-proof.png");
writeFileSync(TMP_IMG, PNG_1x1);

async function login(page, user) {
  await page.goto(`${BASE}/login`);
  await page.fill('input[type="email"]', user.email);
  await page.fill('input[type="password"]', user.password);
  await Promise.all([
    page.waitForURL(BASE + "/", { timeout: 10000 }),
    page.click('button[type="submit"]')
  ]);
}

async function logout(page) {
  await page.goto(`${BASE}/`);
  await page.click('button:has-text("Sair")');
  await page.waitForURL(/\/login/);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  try {
    // -------- 1. LOGIN ADMIN --------
    try {
      await login(page, ADMIN);
      step("Login admin", page.url() === BASE + "/");
      await shot(page, "01-hub-admin");
    } catch (e) {
      step("Login admin", false, e.message);
      throw e;
    }

    // -------- 2. HUB CARREGA ELEMENTOS --------
    try {
      const heading = await page.textContent("h1");
      const hasMeta = await page.getByText(/Meta de Saúde/).count();
      const hasProd = await page.getByText(/Meta de Produtividade/).count();
      const hasRank = await page.getByText(/Ranking Geral/).count();
      step(
        "HUB renderiza elementos principais",
        heading?.includes("Movimento em Jogo") && hasMeta > 0 && hasProd > 0 && hasRank > 0,
        `h1="${heading}"`
      );
    } catch (e) {
      step("HUB renderiza elementos", false, e.message);
    }

    // -------- 3. GESTÃO DE USUÁRIOS --------
    try {
      await page.goto(`${BASE}/admin/usuarios`);
      await page.waitForSelector('h1:has-text("Gestão de Agentes")');
      step("Página de usuários carrega", true);
      await shot(page, "02-usuarios");
    } catch (e) {
      step("Página de usuários carrega", false, e.message);
    }

    // -------- 4. CRIAR NOVO USUÁRIO --------
    try {
      await page.click('button:has-text("+ Recrutar agente")');
      await page.waitForSelector('input[name="name"]');
      await page.fill('input[name="name"]', NEW_USER.name);
      await page.fill('input[name="email"]', NEW_USER.email);
      await page.fill('input[name="sector"]', NEW_USER.sector);
      await page.fill('input[name="password"]', NEW_USER.password);
      await page.click('button:has-text("Confirmar recrutamento")');
      await page.waitForSelector(`td:has-text("${NEW_USER.name}")`, { timeout: 5000 });
      step("Criar novo agente", true, NEW_USER.email);
      await shot(page, "03-agente-criado");
    } catch (e) {
      step("Criar novo agente", false, e.message);
    }

    // -------- 5. LOGOUT ADMIN + LOGIN USUARIO --------
    await logout(page);
    step("Logout admin", true);

    try {
      await login(page, NEW_USER);
      step("Login do novo agente", page.url() === BASE + "/");
    } catch (e) {
      step("Login do novo agente", false, e.message);
      throw e;
    }

    // -------- 6. REGISTRAR ATIVIDADE FÍSICA --------
    try {
      await page.goto(`${BASE}/registrar`);
      await page.waitForSelector('input[name="kcal"]');
      await page.fill('input[name="kcal"]', "420");
      await page.fill('input[name="durationMin"]', "45");
      await page.fill('textarea[name="notes"]', "Teste automatizado e2e");
      await page.selectOption('select[name="type"]', "CORRIDA");
      await page.setInputFiles('input[name="proof"]', TMP_IMG);
      await Promise.all([
        page.waitForURL(BASE + "/minhas", { timeout: 10000 }),
        page.click('button:has-text("Confirmar Registro")')
      ]);
      const pendingVisible = await page.getByText(/Pendente/i).count();
      step("Registrar atividade física", pendingVisible > 0);
      await shot(page, "04-atividade-registrada");
    } catch (e) {
      step("Registrar atividade física", false, e.message);
    }

    // -------- 7. REGISTRAR DEMANDA --------
    try {
      await page.goto(`${BASE}/demandas/nova`);
      await page.waitForSelector('input[name="title"]');
      await page.fill('input[name="title"]', "Holding família Playwright");
      await page.fill('input[name="client"]', "Cliente QA");
      await page.click('button:has-text("Pesada")');
      await page.fill('textarea[name="notes"]', "Demanda teste e2e");
      await page.setInputFiles('input[name="proof"]', TMP_IMG);
      await Promise.all([
        page.waitForURL(BASE + "/demandas", { timeout: 10000 }),
        page.click('button:has-text("Enviar")')
      ]);
      const demandOk = await page.getByText(/Holding família Playwright/i).count();
      step("Registrar demanda ClickUp", demandOk > 0);
      await shot(page, "05-demanda-registrada");
    } catch (e) {
      step("Registrar demanda ClickUp", false, e.message);
    }

    // -------- 8. USUÁRIO COMUM NÃO VÊ /admin --------
    try {
      await page.goto(`${BASE}/admin`);
      await page.waitForURL(BASE + "/", { timeout: 5000 });
      step("Usuário comum bloqueado em /admin", true);
    } catch (e) {
      step("Usuário comum bloqueado em /admin", false, e.message);
    }

    // -------- 9. ADMIN APROVA --------
    await logout(page);
    await login(page, ADMIN);
    try {
      await page.goto(`${BASE}/admin`);
      await page.waitForSelector('h1:has-text("Central de Comando")');
      await shot(page, "06-admin-fila");

      // Aprovar primeira atividade pendente (do user criado)
      const firstActivityApprove = page
        .locator(`div.val-card:has-text("${NEW_USER.name}")`)
        .first()
        .getByRole("button", { name: /Aprovar/i })
        .first();
      if (await firstActivityApprove.count()) {
        await firstActivityApprove.click();
        await page.waitForTimeout(800);
        step("Admin aprova atividade", true);
      } else {
        step("Admin aprova atividade", false, "card não encontrado");
      }

      // Aprovar demanda pendente
      const demandCard = page
        .locator(`div.val-card:has-text("Holding família Playwright")`)
        .first();
      if (await demandCard.count()) {
        await demandCard.getByRole("button", { name: /Aprovar/i }).first().click();
        await page.waitForTimeout(800);
        step("Admin aprova demanda", true);
      } else {
        step("Admin aprova demanda", false, "demanda não encontrada");
      }
      await shot(page, "07-admin-pos-aprovacao");
    } catch (e) {
      step("Admin aprova fila", false, e.message);
    }

    // -------- 10. HUB REFLETE APROVAÇÕES --------
    try {
      await page.goto(`${BASE}/`);
      await page.waitForSelector("h1");
      const bodyText = await page.textContent("body");
      const hasKcal = /kcal/.test(bodyText || "");
      const hasAgente = (bodyText || "").includes(NEW_USER.name);
      step("HUB mostra novo agente nos rankings", hasAgente, hasAgente ? "" : "nome não achado");
      step("HUB contém métricas kcal", hasKcal);
      await shot(page, "08-hub-final");
    } catch (e) {
      step("HUB final", false, e.message);
    }
  } finally {
    await ctx.close();
    await browser.close();
  }

  // sumário
  const passed = results.filter((r) => r.ok).length;
  const failed = results.length - passed;
  console.log("\n========== RESUMO ==========");
  console.log(`${passed}/${results.length} passou · ${failed} falhou`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error("FATAL", e);
  process.exitCode = 1;
});
