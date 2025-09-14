/** @type {import('tailwindcss').Config} */
export default {
  // 役割: Tailwind CSSに対して、どのファイルにクラス名（例: bg-blue-500 や p-4）が書かれているかを教える
  content: [
    // npm run build を実行すると、Tailwind CSSはここで指定されたファイル（index.html と src フォルダ内の全ての .vue や .js ファイルなど）をスキャン。
    // そして、実際に使用されているクラス名だけを抽出し、それに対応するCSSだけを生成。
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      //extend を使うことで、デフォルトの色もカスタムカラーも両方使えるように
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      }
    },
  },
  plugins: [],
}

// 効率化: src フォルダなどを監視して、不要なCSSを削除する設定。
// ブランディング: プロジェクト専用の primary (青系) と success (緑系) のカラーパレットを追加し、デザインに一貫性を持たせる設定。
// 拡張性: 将来的にプラグインを追加できる余地を残している。