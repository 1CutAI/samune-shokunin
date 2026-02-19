import { NextRequest, NextResponse } from "next/server";

const DAILY_FREE_LIMIT = 3;
const usageMap = new Map<string, { count: number; date: string }>();

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const today = new Date().toISOString().slice(0, 10);
  const usage = usageMap.get(ip);
  if (!usage || usage.date !== today) {
    usageMap.set(ip, { count: 0, date: today });
    return { allowed: true, remaining: DAILY_FREE_LIMIT };
  }
  if (usage.count >= DAILY_FREE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: DAILY_FREE_LIMIT - usage.count };
}

function incrementUsage(ip: string) {
  const today = new Date().toISOString().slice(0, 10);
  const usage = usageMap.get(ip);
  if (usage && usage.date === today) {
    usage.count++;
  } else {
    usageMap.set(ip, { count: 1, date: today });
  }
}

type StyleType =
  | "business"
  | "education"
  | "entertainment"
  | "tech"
  | "lifestyle"
  | "news";

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

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "APIキーが設定されていません。" },
      { status: 500 }
    );
  }

  const ip = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      {
        error: "本日の無料利用回数（3回）を使い切りました。",
        remaining: 0,
      },
      { status: 429 }
    );
  }

  let body: {
    videoTitle: string;
    style: StyleType;
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

  if (!videoTitle || videoTitle.trim().length < 3) {
    return NextResponse.json(
      { error: "動画タイトルを3文字以上で入力してください。" },
      { status: 400 }
    );
  }

  const prompt = buildImagePrompt(
    videoTitle,
    style || "business",
    keywords || ""
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

      if (response.status === 400 && errorData?.error?.code === "content_policy_violation") {
        return NextResponse.json(
          { error: "コンテンツポリシーに抵触する可能性があります。別の表現でお試しください。" },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "画像生成中にエラーが発生しました。しばらく後に再度お試しください。" },
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

    incrementUsage(ip);

    return NextResponse.json({
      imageUrl,
      revisedPrompt,
      remaining: remaining - 1,
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "サーバーエラーが発生しました。" },
      { status: 500 }
    );
  }
}
