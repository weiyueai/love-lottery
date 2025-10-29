// 跨设备同步诊断脚本
// 在浏览器控制台运行：copy(document.querySelector('script').textContent) 然后粘贴运行

async function diagnoseSyncIssue() {
  console.log('🔍 开始诊断跨设备同步问题...\n');
  
  // 1. 检查登录状态
  const password = sessionStorage.getItem('kitty_password');
  const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
  
  console.log('1. 登录状态检查:');
  console.log('   密码是否保存:', password ? '✅ 已保存' : '❌ 未保存');
  console.log('   登录状态:', isLoggedIn ? '✅ 已登录' : '❌ 未登录');
  console.log('   会话密码:', password || '无');
  
  // 2. 检查本地数据
  const localEnergy = localStorage.getItem('kitty_energy');
  const localHistory = localStorage.getItem('kitty_history');
  const localPools = localStorage.getItem('kitty_pools');
  const objectId = localStorage.getItem('leancloud_object_id');
  
  console.log('\n2. 本地数据检查:');
  console.log('   能量值:', localEnergy || '0');
  console.log('   历史记录条数:', localHistory ? JSON.parse(localHistory).length : 0);
  console.log('   奖池数据:', localPools ? '✅ 存在' : '❌ 不存在');
  console.log('   LeanCloud对象ID:', objectId || '❌ 不存在');
  
  // 3. 检查LeanCloud配置
  let lcConfigured = false;
  try {
    const lcConfig = await import('./leancloud-config.js?v=' + Date.now());
    lcConfigured = lcConfig.isLeanCloudConfigured();
    console.log('\n3. LeanCloud配置检查:');
    console.log('   配置状态:', lcConfigured ? '✅ 已配置' : '❌ 未配置');
  } catch (error) {
    console.log('\n3. LeanCloud配置检查:');
    console.log('   配置状态: ❌ 配置文件加载失败');
    console.log('   错误:', error.message);
  }
  
  // 4. 检查云端同步状态
  console.log('\n4. 云端同步状态检查:');
  
  if (window.cloudSyncEnabled !== undefined) {
    console.log('   同步功能:', window.cloudSyncEnabled ? '✅ 已启用' : '❌ 未启用');
  } else {
    console.log('   同步功能: ❓ 状态未知');
  }
  
  if (window.firebaseSync) {
    console.log('   同步模块:', '✅ 已加载');
    
    // 尝试手动同步测试
    try {
      console.log('\n5. 测试手动同步...');
      const syncResult = await window.firebaseSync.syncToCloud({
        energy: parseInt(localEnergy || '0'),
        history: JSON.parse(localHistory || '[]'),
        pools: JSON.parse(localPools || 'null')
      });
      
      console.log('   手动同步结果:', syncResult ? '✅ 成功' : '❌ 失败');
    } catch (syncError) {
      console.log('   手动同步结果: ❌ 出错');
      console.log('   同步错误:', syncError.message);
    }
  } else {
    console.log('   同步模块: ❌ 未加载');
  }
  
  // 6. 生成诊断报告
  console.log('\n📋 诊断总结:');
  
  if (!password || !isLoggedIn) {
    console.log('❌ 主要问题: 用户未正确登录');
    console.log('💡 解决方案: 重新登录并确保输入正确密码');
  } else if (!objectId) {
    console.log('❌ 主要问题: 缺少LeanCloud对象ID');
    console.log('💡 解决方案: 需要重新登录以创建云端数据记录');
  } else if (!lcConfigured) {
    console.log('❌ 主要问题: LeanCloud配置不完整');
    console.log('💡 解决方案: 检查leancloud-config.js配置');
  } else if (!window.cloudSyncEnabled || !window.firebaseSync) {
    console.log('❌ 主要问题: 云端同步未正确初始化');
    console.log('💡 解决方案: 刷新页面重新初始化同步功能');
  } else {
    console.log('✅ 基础配置正常，可能是数据传输问题');
    console.log('💡 建议: 尝试手动触发同步或检查网络连接');
  }
  
  console.log('\n🔧 推荐操作顺序:');
  console.log('1. 退出登录');
  console.log('2. 清除浏览器缓存');
  console.log('3. 重新登录 (密码: 230124)');
  console.log('4. 测试添加能量或抽奖');
  console.log('5. 在另一设备重复步骤1-3');
  
  return {
    isLoggedIn,
    hasObjectId: !!objectId,
    isConfigured: lcConfigured,
    isSyncEnabled: window.cloudSyncEnabled,
    hasModule: !!window.firebaseSync
  };
}

// 运行诊断
diagnoseSyncIssue().then(result => {
  console.log('\n🎯 诊断完成，结果对象:', result);
}).catch(error => {
  console.error('❌ 诊断过程出错:', error);
});
