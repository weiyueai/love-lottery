// ============================================
// LeanCloud 配置文件
// ============================================
// 
// 🔧 如何配置：
// 1. 访问 https://www.leancloud.cn/
// 2. 注册账号（邮箱即可，无需实名）
// 3. 创建应用
// 4. 进入应用设置 → 应用凭证
// 5. 复制 AppID、AppKey、服务器地址
// 6. 替换下面的配置
// 
// ⚠️ 注意：建议使用环境变量或私有配置
// ============================================

const leanCloudConfig = {
  // 👇 请替换为您自己的LeanCloud配置
  appId: "a18wkGNz65BN4p8y1jmY20J1-gzGzoHsz",
  appKey: "PowDkwnfNSBylBnqb1tp9E5M",
  serverURL: "https://a18wkgnz.lc-cn-n1-shared.com" // 或其他服务器地址
};

// ============================================
// 配置验证
// ============================================
export function isLeanCloudConfigured() {
  return leanCloudConfig.appId !== "YOUR_APP_ID" &&
         leanCloudConfig.appKey !== "YOUR_APP_KEY";
}

export default leanCloudConfig;

// ============================================
// 配置示例（请替换为真实配置）
// ============================================
// 
// const leanCloudConfig = {
//   appId: "AbCdEfGh123456-xxxxxxx",
//   appKey: "1234567890abcdefghijklmn",
//   serverURL: "https://abcdefgh.lc-cn-n1-shared.com"
// };
// 
// ============================================

