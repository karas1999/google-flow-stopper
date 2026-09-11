# Google Flow Stopper

> [!WARNING]
> **当前版本已失效（2026-09-11 确认）。**
>
> 实测访问 `https://labs.google/fx/tools/flow` 时，服务器直接返回 HTTP 308，跳转到 `https://flow.google.com/`。旧页面尚未加载，扩展的页面脚本就已失去运行机会，因此当前版本无法阻止这条跳转。
>
> **目前没有经过验证的修复方案，不建议为恢复 Flow 访问而安装当前版本。** 已安装的用户可以禁用或卸载扩展。下方保留原理、历史使用说明和源码，供参考。

本项目原用于保留 Google Flow 旧版入口：通过取消从 `labs.google` 前往 `flow.google.com` 的页面导航，让页面继续加载 CSS、字体、图片和项目数据。源码无需构建、无需安装依赖。

## 原先解决什么问题？

部分用户进入 [Flow 旧版入口](https://labs.google/fx/tools/flow) 后，会被自动带到新站点，随后出现 `unsupported-country` 页面。手动按 ESC 有时能保留旧页面，但也可能中断字体等资源的加载，造成图标显示成文字、布局异常。

本扩展仅取消前往新站点的导航，不调用 `window.stop()`，因此不会像 ESC 一样停止其他资源加载。

> 本项目是独立的第三方工具，与 Google 无隶属或背书关系。它不修改账号地区、订阅或服务端权限，也不保证所有账号及生成功能可用。

## 安装（历史说明）

以下步骤仅供研究原版本时参考，不能解决当前的服务器重定向。需要 Chrome 111 或更高版本。

1. 在[仓库首页](https://github.com/karas1999/google-flow-stopper)点击 **Code → Download ZIP**，将 ZIP 解压到准备长期保留的文件夹。
2. 在 Chrome 地址栏输入 `chrome://extensions`。
3. 打开右上角的 **开发者模式**。
4. 点击 **加载已解压的扩展程序**，选择解压后包含 `manifest.json` 的文件夹。
5. 确认扩展已启用，打开 [Flow 旧版入口](https://labs.google/fx/tools/flow)，或刷新已经打开的旧版 Flow 页面。

安装后请保留该文件夹；Chrome 会从这里加载扩展文件。普通使用不需要 Node.js，也不需要运行任何命令。

原版本需要从 **labs.google 旧版入口**进入，不会把 `https://flow.google.com/unsupported-country` 自动带回旧站点。现在重新打开旧入口也无法通过本扩展阻止上述 308 跳转。

## 开关和更新

- 在 `chrome://extensions` 中，通过 Google Flow Stopper 的开关启用或禁用，然后刷新 Flow 页面。已经注入的监听需要刷新才能移除。
- 更新时重新下载仓库 ZIP，用解压后的文件替换原扩展目录中的文件。在扩展管理页点击该扩展的重新加载按钮，再刷新 Flow。此安装方式需要手动更新。
- 卸载时，在扩展管理页点击「移除」，再刷新 Flow 页面。
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

失效前曾在实际 Chrome 环境验证扩展安装生效、项目列表加载、图标显示和进入已有项目；这些是历史结果，不代表当前仍可用，当时也没有覆盖所有账号、地区或生成操作。

2026-09-11 的浏览器网络记录确认，旧入口及一个官网公开的旧域名工具深链均返回 HTTP 308，迁移到 `flow.google.com`。当前扩展只在旧域名的匹配页面中监听可取消的导航，无法处理这种服务器重定向。

本次核查未使用受地区限制的账号，没有验证新站点的地区限制发生在前端还是后端，也没有验证替代方案。当前扩展不拦截新站点的地区错误页，不能改变服务端权限。

## 隐私

扩展不读取 Cookie，不收集或上传账号、项目及浏览记录；没有统计代码，也没有扩展自身发起的外部请求。内容脚本只在匹配的 Flow 页面运行，代码可直接在 [content.js](content.js) 中查看。

## 开发与测试

源码没有第三方依赖，也没有构建步骤：

| 文件 | 用途 |
| --- | --- |
| `manifest.json` | 页面匹配范围和注入配置 |
| `content.js` | 导航拦截逻辑 |
| `tests/navigation.test.cjs` | 导航行为回归检查 |

安装支持 `node:test` 的 Node.js 后，在仓库目录运行：

```sh
node tests/navigation.test.cjs
```

测试覆盖目标域名匹配、项目和登录导航放行、不可取消事件、语言路径和离开 Flow 后的行为。自动测试不替代在 Chrome 中加载扩展后的实际验证。

## 问题反馈

欢迎通过 [Issues](https://github.com/karas1999/google-flow-stopper/issues) 反馈问题。请提供 Chrome 版本、扩展版本、复现步骤，以及跳转前后的域名和路径。

提交截图或网址前，请隐藏邮箱、项目 ID、私有内容和可能包含凭据的查询参数。

参考：[Chrome 内容脚本配置](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts)、[NavigateEvent](https://developer.mozilla.org/en-US/docs/Web/API/NavigateEvent)。
