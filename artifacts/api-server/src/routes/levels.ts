import { Router, type IRouter } from "express";
import { eq, desc, count, sql } from "drizzle-orm";
import { db, levelsTable } from "@workspace/db";
import {
  CreateLevelBody,
  CreateLevelResponse,
  ListLevelsQueryParams,
  ListLevelsResponse,
  GetLevelParams,
  GetLevelResponse,
  DeleteLevelParams,
  DeleteLevelBody,
  DeleteLevelResponse,
  GetLevelStatsResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Simple in-memory rate limiter: max 10 saves per IP per 60s
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const max = 10;
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= max) return false;
  entry.count++;
  return true;
}

function generateSlug(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function generateToken(): string {
  const hex = "0123456789abcdef";
  return Array.from({ length: 32 }, () => hex[Math.floor(Math.random() * hex.length)]).join("");
}

// POST /levels — save a generated level
router.post("/levels", async (req, res): Promise<void> => {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0] || req.socket.remoteAddress || "unknown";
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: "Too many requests — please wait before saving again" });
    return;
  }

  const parsed = CreateLevelBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid create level body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { algorithm, config, gridData, width, height, seed } = parsed.data;

  // Generate a unique slug
  let slug = generateSlug();
  let attempts = 0;
  while (attempts < 5) {
    const existing = await db.select({ id: levelsTable.id }).from(levelsTable).where(eq(levelsTable.slug, slug));
    if (existing.length === 0) break;
    slug = generateSlug();
    attempts++;
  }

  const ownerToken = generateToken();
  const origin = req.headers.origin || `${req.protocol}://${req.headers.host}`;
  const shareUrl = `${origin}/level/${slug}`;

  const [level] = await db
    .insert(levelsTable)
    .values({
      slug,
      algorithm,
      config,
      gridData,
      width,
      height,
      seed,
      ownerToken,
    })
    .returning();

  req.log.info({ slug }, "Level saved");
  res.status(201).json(CreateLevelResponse.parse({ slug: level.slug, ownerToken: level.ownerToken, shareUrl }));
});

// GET /levels — paginated gallery
router.get("/levels", async (req, res): Promise<void> => {
  const parsed = ListLevelsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { page, limit } = parsed.data;
  const offset = (page - 1) * limit;

  const [levels, totalResult] = await Promise.all([
    db
      .select({
        id: levelsTable.id,
        slug: levelsTable.slug,
        algorithm: levelsTable.algorithm,
        width: levelsTable.width,
        height: levelsTable.height,
        seed: levelsTable.seed,
        viewCount: levelsTable.viewCount,
        createdAt: levelsTable.createdAt,
      })
      .from(levelsTable)
      .orderBy(desc(levelsTable.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(levelsTable),
  ]);

  res.json(
    ListLevelsResponse.parse({
      levels,
      total: totalResult[0]?.total ?? 0,
      page,
      limit,
    })
  );
});

// GET /levels/stats — gallery stats (must be before /:slug)
router.get("/levels/stats", async (_req, res): Promise<void> => {
  const [totalResult, byAlgoResult] = await Promise.all([
    db.select({ total: count() }).from(levelsTable),
    db
      .select({ algorithm: levelsTable.algorithm, cnt: count() })
      .from(levelsTable)
      .groupBy(levelsTable.algorithm),
  ]);

  const byAlgorithm: Record<string, number> = {};
  for (const row of byAlgoResult) {
    byAlgorithm[row.algorithm] = row.cnt;
  }

  res.json(
    GetLevelStatsResponse.parse({
      totalLevels: totalResult[0]?.total ?? 0,
      byAlgorithm,
    })
  );
});

// GET /levels/:slug — fetch one level
router.get("/levels/:slug", async (req, res): Promise<void> => {
  const params = GetLevelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [level] = await db
    .select()
    .from(levelsTable)
    .where(eq(levelsTable.slug, params.data.slug));

  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  // Increment view count in background
  db.update(levelsTable)
    .set({ viewCount: sql`${levelsTable.viewCount} + 1` })
    .where(eq(levelsTable.id, level.id))
    .execute()
    .catch(() => {});

  res.json(GetLevelResponse.parse(level));
});

// DELETE /levels/:slug — delete with owner token
router.delete("/levels/:slug", async (req, res): Promise<void> => {
  const params = DeleteLevelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const body = DeleteLevelBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }

  const [level] = await db
    .select({ id: levelsTable.id, ownerToken: levelsTable.ownerToken })
    .from(levelsTable)
    .where(eq(levelsTable.slug, params.data.slug));

  if (!level) {
    res.status(404).json({ error: "Level not found" });
    return;
  }

  if (level.ownerToken !== body.data.ownerToken) {
    res.status(403).json({ error: "Invalid owner token" });
    return;
  }

  await db.delete(levelsTable).where(eq(levelsTable.id, level.id));

  req.log.info({ slug: params.data.slug }, "Level deleted");
  res.json(DeleteLevelResponse.parse({ success: true }));
});

export default router;
