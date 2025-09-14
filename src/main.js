import { createApp } from 'vue'
// Vue.jsのコア機能から、アプリケーションのインスタンス（実体）を作成するための createApp 関数を読み込む
import { createPinia } from 'pinia'
// PiniaはVue.jsの状態管理ライブラリで、コンポーネント間でデータを共有したり、状態を永続化したりするための機能を提供する
import './style.css'   
import App from './App.vue'
import router from './router'
// ページのURLに応じて表示するコンポーネントを切り替える Vue Router の設定を、./router フォルダ（の中のindex.jsなど）から読み込む。

// 読み込んだ部品を使って、アプリケーションの本体とデータ管理の仕組みを作成
const app = createApp(App)
// Vueに「App.vue という部品を土台にして、これからアプリケーションを1つ作りますよ」と宣言する命令
// App.vue は、これから作るアプリの全てのコンポーネントを内包する「一番外側の箱」のようなもの
const pinia = createPinia()
app.use(pinia)
app.use(router)
// 先ほど作ったまっさらなエンジン (app) に、追加機能（プラグイン）を接続

app.mount('#app')
// これまでJavaScriptの世界で組み立ててきた高機能エンジンユニット (app) を、HTMLに埋め込む作業。
// 具体的には、index.html の中にある <div id="app"></div> という空っぽの場所。
// その空っぽの div の中身を、app の内容（つまり App.vue コンポーネントとその子コンポーネント）に丸ごと置き換える。