---
name: dsh-poetry-poetricity
description: Use when running the AI4S Chinese-poetry "poeticity" metric exploration harness — the 4 sub-agent loop (Explorer/Generator/Check/Memory) from research/poetry-poetricity-harness. Orients the agent to the harness's data-boundary rules, round loop, and evaluation protocol.
---

# Poetry-Poetricity Harness

中文诗歌「诗歌性」自动评测探索 harness。这是 AI for Research 开放探索赛的独立研究系统，
作为 DSH 的 research 子模块与 skill 接入。

## 快速使用

```bash
cd research/poetry-poetricity-harness
python harness.py                          # 4 子 Agent + 越界检测自测
python run_harness.py --rounds 2 --model v2   # 真实 v2 指标评估（val kappa）
```

## 子 Agent（方案《第一版.pdf》§2/§3）

| 子 Agent | 类 | 职责 |
|---|---|---|
| Explorer | `ExplorerAgent` | 指标组合搜索（§3.1 阶段 1）|
| Generator | `GeneratorAgent` | AI 仿诗动态提难（§3.1 阶段 2）|
| Check | `CheckAgent` | 数据边界 / 规则审计（§2.1）→ INVALID |
| Memory | `MemoryAgent` | 日志 / 失败 / 规则沉淀（§2.3）|

## 数据边界（AccessGate）

- **读白名单**：`E:\生成诗歌\poetry-judge-train\data\samples`、`eval-annotation\data`、`ChineseHardJudgePoem\data`、`eval-annotation\backups`
- **写白名单**：`E:\ai4s\poetry-poetricity\04_memory`、`05_experiments`、`06_artifacts`
- 越界 → `AccessViolation` → CheckAgent 标 INVALID

## 评估协议（不可修改）

- 固定 val split：`train_val_split(seed=42, val_ratio=0.2)`
- 指标：Quadratic Kappa / Accuracy / F1
- 跨数据集：val(371) + 专家集(100) + AI 诗集(209 human-labeled)
- 测试集**不可见**（方案 §2.1）

## 关键代码

- `harness.py`：harness 核心（4 子 Agent + AccessGate + RoundRecord）
- `plugin_metric_evaluator.py`：把已训练 v2/v4b 指标包装为 evaluator
- `run_harness.py`：CLI 启动器

## 关联仓库

- 完整项目（指标/日志/论文）：https://github.com/shikunpneg/ChinesePoemBenchmark
- 本仓库 `research/poetry-poetricity-harness/` 为独立副本

## 与 DSH 的集成状态

- ✅ 已作为 `research/poetry-poetricity-harness/` 独立子目录
- ✅ 已作为本 skill 接入 `.agents/skills/`
- ⏳ 子 Agent 直接作为 DSH `packages/subagent` 插件（TODO：将 `AgentPlugin` 适配为 DSH subagent provider）