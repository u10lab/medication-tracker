import { defineConfig } from 'vite'
// Viteの defineConfig ヘルパー関数を使って構成。これにより、エディタでのコード補完が効くようになり、設定を書きやすくなる
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    // npm run dev を実行したときのローカル開発サーバーの挙動を細かく制御
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    // true に設定すると、5173 が使えなかった場合は別のポートを探さずにエラーを出して終了
    watch: {
      usePolling: true,
      // usePolling: true: ファイルシステムのイベントに頼らず、一定間隔でファイルが変更されていないかViteが自ら確認しにいく「ポーリング」という方式
      // Dockerコンテナ内など、特定の環境でファイルの変更がうまく検知されない場合に有効な設定
      interval: 100
      // 100ミリ秒（0.1秒）
    },
    hmr: {
      // HMRは、コードを編集した際にページ全体をリロードせず、変更した部分だけを瞬時に差し替える機能。通常は開発サーバーと同じポートで問題ない
      port: 5173
    }
  },
  build: {
    // npm run build を実行したときに、公開用のファイルをどのように生成（ビルド）するかを定義
    rollupOptions: {
      // 複数に分散したJavaScriptのコードやモジュールを1つのファイルにまとめる、JavaScriptモジュールバンドラー
      output: {
        manualChunks: {
          // Viteは自動でコードを分割してく、manualChunks を使うとより細かな制御が可能
          vendor: ['vue', 'vue-router', 'pinia'],
          // vue, vue-router, pinia という3つのライブラリをまとめて vendor.js という名前の単一のファイル（チャンク）に出力
          ui: ['@headlessui/vue']
          // @headlessui/vue を ui.js という別のファイルに分割
        }
      }
    }
  }
})


