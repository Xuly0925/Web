# Workbody · 图书馆空位查询与预约轻量化网页

> 面向在校大学生，浏览器直接打开即可使用，免下载、无后端、轻量化。

## 文件结构

```
Web/
├── index.html      ← 页面结构
├── style.css       ← 样式与响应式布局
├── script.js       ← 交互逻辑与模拟数据
└── README.md       ← 本说明文件
```

## 快速使用

直接用浏览器打开 `index.html` 即可，无需安装任何环境。

---

## 修改指南

### 一、修改楼层数量与座位数据

打开 `script.js`，找到文件顶部的 `FLOORS_DATA` 配置数组：

```javascript
const FLOORS_DATA = [
    {
        id: 1,              // 楼层ID（必须唯一，从1开始递增）
        name: "一楼",        // 楼层显示名称
        desc: "综合阅览区",   // 楼层描述文字
        totalSeats: 80,      // 总座位数
        rows: 8,             // 座位行数
        cols: 10             // 座位列数（rows × cols 应等于 totalSeats）
    },
    // ... 继续添加更多楼层
];
```

**添加楼层**：在数组中追加新的对象即可。

**删除楼层**：删掉对应的对象即可。

**修改座位数**：修改 `totalSeats`、`rows`、`cols` 三个字段。

**修改繁忙程度**：找到 `initFloors()` 函数中的 `occupancyRate` 数组：

```javascript
const occupancyRate = [0.35, 0.55, 0.70, 0.85, 0.30][floorData.id - 1] || 0.5;
```

- `0.35` = 35% 的座位被占用（一楼较空）
- `0.85` = 85% 的座位被占用（四楼较满）
- 数组顺序对应楼层ID（一楼→五楼），添加新楼层记得在数组中补充对应值。

### 二、修改配色方案

打开 `style.css`，找到文件顶部的 `:root` 变量区：

```css
:root {
    --color-primary: #4A90D9;        /* 主蓝色（导航栏、按钮等） */
    --color-primary-light: #6BA5E0;  /* 浅蓝色（hover效果） */
    --color-primary-dark: #3A7BC8;   /* 深蓝色（点击效果） */
    --color-bg: #F0F6FC;             /* 页面背景色 */
    
    --color-green: #52C41A;          /* 空闲状态色 */
    --color-yellow: #FAAD14;         /* 适中/已预约状态色 */
    --color-red: #FF4D4F;            /* 拥挤/已占用状态色 */
    --color-blue: #1890FF;           /* 选中状态色 */
}
```

只需修改这些变量的颜色值，全站配色会自动同步更新。

### 三、修改预约时长选项

打开 `index.html`，找到预约时长按钮区域：

```html
<div class="duration-options" id="durationOptions">
    <button class="duration-btn" data-minutes="15">15 分钟</button>
    <button class="duration-btn active" data-minutes="30">30 分钟</button>
    <button class="duration-btn" data-minutes="45">45 分钟</button>
    <button class="duration-btn" data-minutes="60">60 分钟</button>
</div>
```

- 修改 `data-minutes` 值可调整时长
- 添加/删除按钮即可增减选项
- 带 `active` 类的为默认选中项

### 四、修改使用须知内容

打开 `index.html`，找到底部 `tips-section` 区域，每个 `<div class="tip-card">` 是一个提示卡片，直接修改文字即可。

---

## 功能说明

| 功能 | 说明 |
|------|------|
| 空位总览 | 展示各楼层总座位、空闲数、拥挤状态，支持手动刷新 |
| 楼层详情 | 点击楼层查看座位可视化布局，色块区分空闲/占用/预约 |
| 智能推荐 | 自动推荐空位最多、使用率最低的楼层 |
| 座位预约 | 选中空闲座位 → 选择时长 → 确认预约，座位自动锁定 |
| 取消预约 | 点击自己已预约的座位可取消，释放座位 |
| 响应式 | 完美适配手机、平板、电脑，窗口缩放不错乱 |

## 颜色规范

| 颜色 | 含义 |
|------|------|
| 🟢 绿色 | 空闲座位 / 空闲楼层 |
| 🟡 黄色 | 人流适中 / 已预约座位 |
| 🔴 红色 | 拥挤 / 已占用座位 |
| 🔵 蓝色 | 当前选中座位 |

---

_Workbody · 纯前端轻量化网页 · 浏览器直接打开_
