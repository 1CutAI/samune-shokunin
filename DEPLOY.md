# サムネ職人 デプロイ手順

## 事前準備

### 1. OpenAI APIキーの発行
1. https://platform.openai.com/api-keys にアクセス
2. 「Create new secret key」をクリック
3. 名前に「samune-shokunin」と入力して作成
4. 表示されたキー（sk-...）をコピーして安全な場所に保存

### 2. ローカル動作テスト（任意）
```bash
cd ~/Projects/samune-shokunin
cp .env.local.example .env.local
# .env.local を編集してAPIキーを設定
npm run dev
# ブラウザで http://localhost:3000 を確認
```

## Vercelデプロイ

### Step 1: Vercelにインポート
1. https://vercel.com/new にアクセス
2. 「Import Git Repository」で `1CutAI/samune-shokunin` を選択
3. Framework: **Next.js**（自動検出）
4. Root Directory: そのまま（/）

### Step 2: 環境変数の設定
「Environment Variables」セクションで以下を追加:

| Key | Value | 必須 |
|-----|-------|------|
| `OPENAI_API_KEY` | `sk-...`（Step 1で取得したキー） | 必須 |
| `NEXT_PUBLIC_GA_ID` | `G-XXXXXXXXXX`（GA4の測定ID） | 任意 |
| `NEXT_PUBLIC_SITE_URL` | `https://samune.trimora.jp` | 任意 |

### Step 3: デプロイ
「Deploy」ボタンをクリック → 2〜3分で完了

### Step 4: カスタムドメイン設定（任意）
1. Vercelダッシュボード → Settings → Domains
2. `samune.trimora.jp` を追加
3. DNSで CNAME レコードを設定:
   - `samune` → `cname.vercel-dns.com`

## デプロイ後の確認

- [ ] トップページが表示される
- [ ] 動画タイトル入力 → サムネイル生成が動作する
- [ ] ダウンロードが正常に動作する
- [ ] スマホ表示が崩れていない
- [ ] 1日3回の制限が機能する

## 運用コスト

| 項目 | 月額 |
|------|------|
| Vercel Hobby（無料） | ¥0 |
| OpenAI DALL-E 3 | 約¥2,000〜4,000（利用量による） |
| ドメイン（任意） | 約¥100/月 |
| **合計** | **約¥2,100〜4,100** |

※ DALL-E 3: Standard 1792x1024 = $0.080/枚 ≒ ¥12/枚
