# research/ — AI4S 研究用子 Agent 系统

本目录存放独立的研究型 agent 系统，与 DSH 主框架（`packages/`）并行，**不修改主框架代码**。

## poetry-poetricity-harness

**中文诗歌「诗歌性」自动评测探索 harness**（AI for Research 开放探索赛）。

对应项目方案《第一版.pdf》的 §2 环境接口 / §3 发现信号 / §4.1 试跑闭环：

| 子 Agent | 职责 |
|---|---|
| ExplorerAgent | 指标组合探索（§3.1 阶段 1）|
| GeneratorAgent | AI 仿诗生成 / 动态提难（§3.1 阶段 2）|
| CheckAgent | 数据边界 / 规则审计（§2.1）|
| MemoryAgent | 实验日志 / 失败样本 / 规则沉淀（§2.3）|

### 快速开始

```bash
cd research/poetry-poetricity-harness
python harness.py                     # 4 子 Agent 自测
python run_harness.py --rounds 2 --model v2   # 真实 v2 指标评估
```

### 与 DSH 的关系

- 本 harness 是**独立可运行**的研究代码（纯 Python + sklearn）
- 设计上遵循 DSH 的插件化思想：每个子 Agent 实现 `AgentPlugin` 接口
- **✅ 方案 1**：已作为 `research/poetry-poetricity-harness/` 独立子目录
- **✅ 方案 3**：已作为 DSH 插件接入（两层）：
  1. `.agents/skills/dsh-poetry-poetricity/` — 仓库级 skill
  2. `poetry-poetricity-harness/dsh-plugin/` — 可发布的 TS skill provider
     (`@shikunpneg/dsh-poetry-poetricity`)，注册 `ctx.skills.registerProvider`，
     模型可调用 `poetry-poetricity` skill 驱动 Python harness

### 关联仓库

- 项目完整代码：https://github.com/shikunpneg/ChinesePoemBenchmark
  （含指标实现、实验日志、论文初稿）