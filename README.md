# 宝宝辅食排敏助手

一个纯前端的婴幼儿辅食排敏界面应用（离线可用，数据保存在浏览器 LocalStorage）。

## 功能

- 宝宝档案录入（昵称、出生日期、既往敏感史）
- 食材引入记录（首试日期、初始份量、风险等级）
- 每日症状观察（食材关联 + 严重程度）
- 可视化看板（3 天观察进度条、状态建议、时间线）
- 统计概览卡片（食材数、观察数、中高风险反应数、3天观察完成数）
- 一键导出 JSON、清空数据、填充示例数据

## 使用

直接在浏览器打开 `index.html` 即可。

## 调试指南

### 1) 启动本地静态服务（推荐）

```bash
python -m http.server 5173
```

然后访问：<http://127.0.0.1:5173>

### 2) 打开浏览器开发者工具

- Chrome/Edge: `F12` 或 `Ctrl+Shift+I`
- 重点查看：
  - **Console**：JavaScript 报错、`alert` 触发情况
  - **Application > Local Storage**：查看键 `baby-food-allergy-tracker` 是否正确写入
  - **Network**：确认 `index.html`、`style.css`、`app.js` 是否加载成功

### 3) 常用排错动作

- 点击“清空数据”后，确认 `localStorage` 中对应 key 被重置。
- 点击“填充示例”后，确认统计卡片、看板时间线、进度条有变化。
- 手动添加食材与症状，确认状态建议会根据严重程度变化。

### 4) 代码级调试建议

- 在 `app.js` 的 `save()`、`load()`、`renderBoard()`、`fillDemoData()` 中打断点排查状态流转。
- 临时加入：

```js
console.log("state", structuredClone(state));
```

用于核对提交表单后的数据结构是否符合预期。
