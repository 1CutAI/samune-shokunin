import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ============================================================
// レート制限（Upstash Redis → 永続化。未設定時はインメモリfallback）
// ============================================================
const DAILY_FREE_LIMIT = 3;

const hasUpstash =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

// Upstash Ratelimit（本番用: サーバーレスでも永続）
const ratelimit = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.fixedWindow(DAILY_FREE_LIMIT, "1 d"),
      analytics: true,
      prefix: "samune-shokunin",
    })
  : null;

// インメモリfallback（開発用のみ — Vercel本番では使わないこと）
const memoryMap = new Map<string, { count: number; date: string }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

async function checkAndIncrementLimit(
  ip: string
): Promise<{ allowed: boolean; remaining: number }> {
  // Upstash（本番）
  if (ratelimit) {
    const result = await ratelimit.limit(ip);
    return { allowed: result.success, remaining: result.remaining };
  }

  // インメモリfallback（開発用）
  const today = new Date().toISOString().slice(0, 10);
  const usage = memoryMap.get(ip);
  if (!usage || usage.date !== today) {
    memoryMap.set(ip, { count: 1, date: today });
    return { allowed: true, remaining: DAILY_FREE_LIMIT - 1 };
  }
  if (usage.count >= DAILY_FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  usage.count++;
  return { allowed: true, remaining: DAILY_FREE_LIMIT - usage.count };
}

// ============================================================
// スタイル定義
// ============================================================
const VALID_STYLES = [
  "business",
  "education",
  "entertainment",
  "tech",
  "lifestyle",
  "news",
] as const;
type StyleType = (typeof VALID_STYLES)[number];

const stylePrompts: Record<StyleType, string> = {
  business:
    "Professional business style. Clean corporate look with bold typography implications. Navy blue, white, and gold color scheme. Modern office or graph/chart imagery in background.",
  education:
    "Educational/tutorial style. Bright, friendly, and approachable. Use warm colors (orange, yellow, teal). Include subtle icons or visual elements suggesting learning.",
  entertainment:
    "Entertainment/vlog style. High energy, vibrant colors (red, yellow, electric blue). Dynamic composition with bold visual impact. Eye-catching and fun.",
  tech:
    "Tech/programming style. Dark background with neon accents (cyan, purple, green). Futuristic/digital aesthetic. Circuit patterns or code-like visual elements.",
  lifestyle:
    "Lifestyle/wellness style. Soft, natural colors (sage green, blush pink, cream). Warm lighting, cozy aesthetic. Minimalist and calming composition.",
  news:
    "News/commentary style. Bold red and white color scheme with high contrast. Urgent, attention-grabbing design. Clean sans-serif typography feel.",
};

// ============================================================
// バリデーション定数
// ============================================================
const MAX_TITLE_LENGTH = 200;
const MAX_KEYWORDS_LENGTH = 100;

function buildImagePrompt(
  videoTitle: string,
  style: StyleType,
  keywords: string
): string {
  const styleHint = stylePrompts[style] || stylePrompts.business;

  return `Create a YouTube thumbnail image (16:9 landscape ratio).

TOPIC: "${videoTitle}"
${keywords ? `KEYWORDS: ${keywords}` : ""}

STYLE: ${styleHint}

CRITICAL RULES:
- DO NOT include any text, letters, numbers, words, or typography in the image
- NO Japanese characters, NO English text, NO numbers anywhere
- The image should be PURELY VISUAL - only graphics, photos, illustrations
- High visual impact that makes viewers want to click
- Clear focal point with strong composition
- Rich colors and high contrast for small thumbnail visibility
- Professional quality, not AI-looking
- The image should visually represent the topic without any text
- 16:9 aspect ratio (1280x720 equivalent composition)`;
}

// ============================================================
// POST ハンドラ
// ============================================================
export async function POST(request: NextRequest) {
  // --- APIキー確認 ---
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。" },
      { status: 500 }
    );
  }

  // --- CSRF対策: Originヘッダー検証 ---
  const origin = request.headers.get("origin");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const allowedOrigins = [
    siteUrl,
    "http://localhost:3000",
  ].filter(Boolean);

  if (origin && allowedOrigins.length > 0 && !allowedOrigins.includes(origin)) {
    return NextResponse.json(
      { error: "不正なリクエスト元です。" },
      { status: 403 }
    );
  }

  // --- レート制限 ---
  const ip = getClientIP(request);
  const { allowed, remaining } = await checkAndIncrementLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "本日の無料利用回数（3回）を使い切りました。",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  // --- リクエストボディのパース ---
  let body: {
    videoTitle: string;
    style: string;
    keywords: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "リクエストの形式が正しくありません。" },
      { status: 400 }
    );
  }

  const { videoTitle, style, keywords } = body;

  // --- サーバーサイド入力バリデーション ---
  if (!videoTitle || videoTitle.trim().length < 3) {
    return NextResponse.json(
      { error: "動画タイトルを3文字以上で入力してください。" },
      { status: 400 }
    );
  }

  if (videoTitle.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `タイトルは${MAX_TITLE_LENGTH}文字以内で入力してください。` },
      { status: 400 }
    );
  }

  if (keywords && keywords.length > MAX_KEYWORDS_LENGTH) {
    return NextResponse.json(
      { error: `キーワードは${MAX_KEYWORDS_LENGTH}文字以内で入力してください。` },
      { status: 400 }
    );
  }

  const validatedStyle: StyleType =
    style && (VALID_STYLES as readonly string[]).includes(style)
      ? (style as StyleType)
      : "business";

  // --- プロンプト生成 & OpenAI API呼び出し ---
  const prompt = buildImagePrompt(
    videoTitle.trim(),
    validatedStyle,
    keywords?.trim() || ""
  );

  try {
    const response = await fetch(
      "https://api.openai.com/v1/images/generations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt,
          n: 1,
          size: "1792x1024",
          quality: "standard",
          response_format: "url",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenAI Images API error:", errorData);

      if (
        response.status === 400 &&
        errorData?.error?.code === "content_policy_violation"
      ) {
        return NextResponse.json(
          {
            error:
              "コンテンツポリシーに抵触する可能性があります。別の表現でお試しください。",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error:
            "画像生成中にエラーが発生しました。しばらく後に再度お試しください。",
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    const revisedPrompt = data.data?.[0]?.revised_prompt;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "画像の生成に失敗しました。" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      imageUrl,
      revisedPrompt,
      remaining,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
