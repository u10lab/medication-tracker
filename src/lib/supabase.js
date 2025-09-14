import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// デバッグ用: Supabase設定をコンソールに出力
console.log('🔧 Supabase Configuration:', {
  url: supabaseUrl,
  anonKey: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'Not set',
  environment: import.meta.env.MODE
})

// 設定の検証
if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL is not set')
}
if (!supabaseAnonKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY is not set')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)