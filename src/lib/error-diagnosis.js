/**
 * npm install / upgrade 常见错误诊断
 * 解析 npm 错误信息，返回用户友好的提示和修复建议
 */

/**
 * @param {string} errStr - npm 错误输出
 * @returns {{ title: string, hint?: string, command?: string }}
 */
export function diagnoseInstallError(errStr) {
  const s = errStr.toLowerCase()

  // git SSH 权限问题（有 git 但没配 SSH Key）
  if (s.includes('permission denied (publickey)') || s.includes('ssh://git@github')) {
    return {
      title: '安装失败 — Git SSH 权限',
      hint: '依赖包用了 SSH 协议拉取代码，但你没配 GitHub SSH Key。运行以下命令改用 HTTPS：',
      command: 'git config --global url."https://github.com/".insteadOf ssh://git@github.com/',
    }
  }

  // git 未安装（exit 128 + access rights）
  if (s.includes('code 128') || s.includes('exit 128') || s.includes('access rights')) {
    return {
      title: '安装失败 — 需要安装 Git',
      hint: '部分依赖需要通过 Git 下载。请先安装 Git 后重试。',
      command: '下载 Git: https://git-scm.com/downloads',
    }
  }

  // EPERM（文件被占用/权限问题）
  if (s.includes('eperm') || s.includes('operation not permitted')) {
    return {
      title: '安装失败 — 文件被占用',
      hint: '有文件被锁定无法写入。先关闭所有 ClawPanel 和 Node.js 进程，然后在管理员终端手动安装：',
      command: 'npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com',
    }
  }

  // MODULE_NOT_FOUND（安装不完整）
  if (s.includes('module_not_found') || s.includes('cannot find module')) {
    return {
      title: '安装不完整',
      hint: '上次安装可能中断了。先清理残留再重装：',
      command: 'npm cache clean --force && npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com',
    }
  }

  // ENOENT（文件找不到）
  if (s.includes('enoent') || s.includes('-4058') || s.includes('code -4058')) {
    return {
      title: '安装失败 — 文件访问错误',
      hint: '尝试以管理员身份运行 ClawPanel，或在终端手动安装：',
      command: 'npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com',
    }
  }

  // 权限不足（EACCES / EPERM）
  if (s.includes('eacces') || s.includes('eperm') || s.includes('permission denied')) {
    const isMac = navigator.platform?.includes('Mac') || navigator.userAgent?.includes('Mac')
    return {
      title: '安装失败 — 权限不足',
      hint: isMac ? '请在终端使用 sudo 安装：' : '请以管理员身份打开终端安装：',
      command: isMac
        ? 'sudo npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com'
        : 'npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com',
    }
  }

  // 网络错误
  if (s.includes('etimedout') || s.includes('econnrefused') || s.includes('enotfound')
    || s.includes('network') || s.includes('fetch failed') || s.includes('socket hang up')) {
    return {
      title: '安装失败 — 网络连接错误',
      hint: '请检查网络连接，或尝试切换 npm 镜像源后重试。',
    }
  }

  // npm 缓存损坏
  if (s.includes('integrity') || s.includes('sha512') || s.includes('cache')) {
    return {
      title: '安装失败 — npm 缓存异常',
      hint: '尝试清理 npm 缓存后重试：',
      command: 'npm cache clean --force',
    }
  }

  // 通用 fallback
  return {
    title: '安装失败',
    hint: '请在终端手动尝试安装，查看完整错误信息：',
    command: 'npm install -g @qingchencloud/openclaw-zh --registry https://registry.npmmirror.com',
  }
}
