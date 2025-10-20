// ============================================
// Firebase 配置文件
// ============================================
// 
// 🔧 如何配置：
// 1. 访问 https://console.firebase.google.com/
// 2. 创建新项目或选择现有项目
// 3. 点击 "添加应用" → "Web"
// 4. 复制配置信息，替换下面的内容
// 5. 启用 Firestore Database（测试模式）
// 
// ⚠️ 注意：请不要将此文件提交到公开的GitHub仓库
// 建议使用环境变量或私有配置
// ============================================

const firebaseConfig = {
  // 👇 请替换为您自己的Firebase配置
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ============================================
// 配置验证
// ============================================
export function isFirebaseConfigured() {
  return firebaseConfig.apiKey !== "YOUR_API_KEY" &&
         firebaseConfig.projectId !== "YOUR_PROJECT_ID";
}

export default firebaseConfig;

// ============================================
// 配置示例（请替换为真实配置）
// ============================================
// 
// const firebaseConfig = {
//   apiKey: "AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567",
//   authDomain: "my-kitty-app.firebaseapp.com",
//   projectId: "my-kitty-app",
//   storageBucket: "my-kitty-app.appspot.com",
//   messagingSenderId: "123456789012",
//   appId: "1:123456789012:web:abcdef1234567890"
// };
// 
// ============================================

