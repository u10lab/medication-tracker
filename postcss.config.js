export default {
  // 「どのプラグインを、どの順番で使うか」をPostCSSに指示する設計図
  plugins: {
    tailwindcss: {},
    // Tailwind CSSの便利なクラス名を、ブラウザが理解できる本物のCSSコードに変換する役割を担う
    autoprefixer: {},
    // 書いたCSSが様々なブラウザで正しく表示されるように、自動で互換性対応をしてくれる便利なツール
  },
}