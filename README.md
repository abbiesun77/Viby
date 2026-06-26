# Viby

短片创作工作流平台。从一个想法出发，经过脚本、分镜、素材管理，完成一支短片的完整创作流程。

## 功能

- **三步创作流程** — 想法 → 脚本 → 分镜，结构化推进创作
- **Demo 模式** — 无需注册，直接体验完整工作流
- **素材管理** — 上传、组织、导出项目素材
- **多入口创作** — 支持从灵感、脚本或分镜任意节点开始

## 技术栈

- [Next.js 14](https://nextjs.org/) (App Router)
- [Supabase](https://supabase.com/) — 认证 + 数据库
- [Drizzle ORM](https://orm.drizzle.team/)
- [Tailwind CSS](https://tailwindcss.com/)

## 本地开发

```bash
npm install
cp .env.example .env.local  # 填入 Supabase 配置
npm run dev
```

详细环境配置见 [docs/local-dev-setup.md](docs/local-dev-setup.md)。

## 测试

```bash
npm test          # 单元测试
npm run test:e2e  # E2E 测试（需先启动 dev server）
```
