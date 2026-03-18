# 🌊 风之海·生日活动邀请

一个精美的风之海主题生日活动邀请网页，采用玻璃拟态设计风格，配合粒子动画、波浪效果和音乐播放器，为参与者带来沉浸式的视觉体验。

## ✨ 特性

- **精美视觉设计**
  - 玻璃拟态（Glassmorphism）卡片设计
  - 粒子系统背景动画
  - 动态波浪效果
  - 极光背景与流光特效
  - 视差滚动效果

- **交互功能**
  - 邀请确认/婉拒流程
  - 昵称输入与验证
  - 留言反馈功能
  - 音乐播放器（支持自定义上传）
  - 涟漪按钮效果

- **数据存储**
  - IndexedDB 本地存储
  - Supabase 云端数据库支持
  - 数据导出为 JSON

## 🚀 快速开始

### 本地运行

```bash
# 克隆仓库
git clone <your-repo-url>
cd wind-sea-invitation

# 使用 Python 启动本地服务器
python -m http.server 8000

# 或使用 Node.js
npx http-server -p 8000
```

然后在浏览器中访问 `http://localhost:8000`

## ⚙️ 配置

### Supabase 配置

1. 访问 [Supabase](https://supabase.com/) 注册账号
2. 创建新项目
3. 在 SQL Editor 中运行以下命令创建数据表：

```sql
-- 创建 participants 表
CREATE TABLE IF NOT EXISTS participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('accepted', 'declined')),
    timestamp TEXT NOT NULL,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_participants_nickname ON participants(nickname);
CREATE INDEX IF NOT EXISTS idx_participants_timestamp ON participants(timestamp);
CREATE INDEX IF NOT EXISTS idx_participants_status ON participants(status);

-- 启用行级安全策略
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- 允许插入数据
DROP POLICY IF EXISTS "Allow insert for all users" ON participants;
CREATE POLICY "Allow insert for all users" 
ON participants FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 允许读取数据
DROP POLICY IF EXISTS "Allow select for all users" ON participants;
CREATE POLICY "Allow select for all users" 
ON participants FOR SELECT 
TO anon, authenticated
USING (true);
```

4. 获取项目 URL 和 anon Key，在 `js/main.js` 中配置：

```javascript
const SUPABASE_CONFIG = {
    url: 'https://your-project-id.supabase.co',
    anonKey: 'your-anon-key-here'
};
```

### 活动信息修改

在 `index.html` 中修改以下内容：

- 活动时间：第 86 行
- 活动地点：第 84 行
- 提示信息：第 88 行

## 📁 项目结构

```
wind-sea-invitation/
├── index.html          # 主页面
├── css/
│   └── style.css      # 样式文件
├── js/
│   └── main.js        # JavaScript 逻辑
├── README.md          # 项目说明
├── SUPABASE_SETUP.md  # Supabase 配置指南
├── PRIVACY.md         # 隐私政策
└── EMAILJS_SETUP.md   # EmailJS 配置指南（可选）
```

## 🎨 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式与动画
  - Glassmorphism 设计
  - CSS 动画与过渡
  - 渐变与光效
- **JavaScript (ES6+)** - 交互逻辑
  - Canvas 粒子系统
  - Canvas 波浪效果
  - IndexedDB 数据存储
  - Supabase SDK 集成

## 🌐 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 📝 使用说明

### 参与者操作流程

1. 访问邀请页面
2. 点击「接受邀请」或「婉拒邀请」
3. 如接受邀请，输入昵称（2-15字符，支持中文）
4. 确认后查看活动详情
5. 如婉拒邀请，可选择性留下反馈

### 管理员操作

在浏览器控制台可使用以下命令：

```javascript
// 查看所有参与者数据
showAllParticipants()

// 清空所有数据
clearAllData()

// 导出数据为 JSON
exportData()
```

## 🔒 隐私说明

- 参与者数据默认存储在浏览器本地 IndexedDB
- 启用 Supabase 后，数据将同步上传至云端
- 所有操作均在客户端完成，无用户追踪

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**风之海** - 愿你的生日如风般自由，如海般辽阔 🌊
