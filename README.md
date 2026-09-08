# Google Flow Stopper

一个无需构建、无需依赖的 Chrome Manifest V3 扩展。进入旧版 Google Flow 时，取消前往 `flow.google.com` 的导航，保留旧版页面，继续加载 CSS、字体、图片和项目数据。

## 安装

1. 在 Chrome 地址栏输入 `chrome://extensions`。
2. 打开右上角的「开发者模式」。
3. 点击「加载已解压的扩展程序」。
4. 选择包含 `manifest.json` 的目录：`C:\Git\google-flow-stopper`。
5. 打开 https://labs.google/fx/tools/flow ，或刷新已经打开的旧版 Flow 页面。

如果当前在 `https://flow.google.com/unsupported-country`，请重新打开上面的 **labs.google 旧版入口**。扩展不会把新站点自动带回旧站点。

## 开关和更新

- 在 `chrome://extensions` 中，通过 Google Flow Stopper 的开关启用或禁用，然后刷新 Flow 页面。已经注入的监听需要刷新才能移除。
- 更新文件后，在扩展管理页点击该扩展的重新加载按钮，再刷新 Flow。
- 不需要固定到工具栏；扩展自动运行，没有弹窗。

## 工作原理与范围

扩展在 `document_start`、页面主执行环境中监听 Navigation API 的 `navigate` 事件。当前页面属于 `labs.google/fx/.../tools/flow` 且目标主机恰好为 `flow.google.com` 时，对可取消的导航调用 `preventDefault()`。

- 取消的是从旧入口前往新站点的导航，不是新站点里的 `unsupported-country` 路由。
- 不调用 `window.stop()`，不修改网络响应、账号地区或项目数据。
- 允许旧站点内部进入项目，也允许前往其他域名。
- 从旧版 Flow 主动点击前往 `flow.google.com` 的同标签页链接也会被取消。如需访问新站点，可以新开标签页，或禁用扩展后刷新。
- 不申请 cookies、tabs、debugger、storage 或全站访问权限；没有后台服务和外部请求。
- 只在匹配的页面加载时注入。如果从其他单页应用路由进入 Flow 而未重新加载，需刷新一次。

## 验证与限制

2026-09-08 在实际登录的 Chrome 中，通过临时页面脚本验证了相同的拦截机制：前往 `https://flow.google.com/` 的导航可取消；项目列表、图标字体正常加载；点击已有项目可进入，媒体缩略图及项目界面正常显示。没有提交生成任务，因此不承诺所有生成操作可用。

2026-09-08 用户已在 Chrome 中安装扩展并确认生效。网站调整导航方式、移除旧版入口或在服务端限制功能后，本扩展可能失效。

本地回归检查：`node tests/navigation.test.cjs`。5 项检查已通过，涵盖目标域名匹配、项目和登录导航放行、不可取消事件、语言路径和离开 Flow 后的行为。

参考：[Chrome 内容脚本配置](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts)、[NavigateEvent](https://developer.mozilla.org/en-US/docs/Web/API/NavigateEvent)。
