# AI4S 诗歌性探索 Harness — 子 Agent 插件系统

> 对应方案《第一版.pdf》§2 环境接口 / §3 发现信号 / §4.1 试跑闭环
> 位置：`03_agent_harness/harness/`

## 一、子 Agent 划分（4 个）

| 子 Agent | 类 | 职责（对应方案章节） |
|---|---|---|
| **探索 Agent** | `ExplorerAgent` | 指标组合搜索（§3.1 阶段 1）：提出特征组合 → 评估与人类一致性 → 迭代 |
| **生成 Agent** | `GeneratorAgent` | AI 仿诗生成（§3.1 阶段 2）：动态提高相似度 → 收集困难样本 |
| **审计 Agent** | `CheckAgent` | 边界审计（§2.1 稳定约束）：数据越界 / 规则绕过 / 协议修改 → 标 INVALID |
| **记忆 Agent** | `MemoryAgent` | 记录与记忆（§2.3）：实验日志 / 失败样本 / 违规规则沉淀 |

## 二、插件接口

所有子 Agent 实现 `AgentPlugin` 抽象接口：

```python
class AgentPlugin(ABC):
    def observe(self, state: dict) -> dict: ...   # 观察
    def act(self, state: dict) -> dict: ...       # 行动
    def reflect(self, result: dict) -> dict: ...  # 归纳
    def audit_hook(self, record) -> None: ...     # 审计钩子
```

## 三、数据边界强制（AccessGate）

方案 §2.1「环境边界」由 `AccessGate` 强制执行：

- **读白名单**：`E:\生成诗歌\poetry-judge-train\data\samples` / `eval-annotation\data` / `ChineseHardJudgePoem\data` / `eval-annotation\backups`
- **写白名单**：`E:\ai4s\poetry-poetricity\04_memory` / `05_experiments` / `06_artifacts`
- 越界 → 抛 `AccessViolation` → CheckAgent 标 INVALID

## 四、运行闭环（方案 §4.1 试跑）

```
run_round():
  1. observe    所有插件观察当前状态
  2. explore    ExplorerAgent 提出 combo
  3. pre-check  CheckAgent 前置审计（越界 -> 本轮 INVALID 返回）
  4. evaluate   evaluator 计算与人类一致性
  5. reflect    ExplorerAgent 更新 best
  6. post-check CheckAgent 后置审计（检查动作/产物路径）
  7. remember   MemoryAgent 保存 round + failures + rules
```

## 五、接入真实评估器

`plugin_metric_evaluator.py::MetricEvaluator` 把已训练指标（v2/v4b）包装为 evaluator：

```bash
cd 03_agent_harness/harness
python run_harness.py --rounds 2 --model v2
```

输出：每轮 kappa/acc/f1 + VALID/INVALID + `05_experiments/dry_run/harness_run.json`

## 六、日志命名

- 实验记录：`04_memory/experiment_logs/harness_round_<NNN>.json`（前缀 `harness_` 避免与手工实验冲突）
- 失败样本：`04_memory/failures/harness_round_<NNN>.jsonl`
- 违规规则：`04_memory/rules_memory/`

## 七、验证（自测）

```bash
python harness.py           # 4 子 Agent + 闭环 + 越界检测自测
python run_harness.py --rounds 2 --model v2   # 真实 v2 评估
```

实测：v2 冻结指标 kappa=0.9303（val 371），2 轮 VALID。

## 八、DSH 插件接入（方案 3）

`dsh-plugin/` 是本 harness 的 DSH 插件化封装：

- `dsh-plugin/package.json` — `@shikunpneg/dsh-poetry-poetricity`
- `dsh-plugin/src/index.ts` — TS skill provider（仿 `packages/skill/skill-badge` 模式），
  注册 `ctx.skills.registerProvider`，模型可调用 `poetry-poetricity` skill
- `dsh-plugin/SKILL.md` — 模型可读的 skill body（何时用 + 怎么驱动 Python harness）

### 构建插件

```bash
# 假设你已 clone dsh 主仓库并 pnpm install
cd <dsh-repo>/research/poetry-poetricity-harness/dsh-plugin

# 仅类型检查（不污染主仓库，推荐验证用）
pnpm exec tsc --noEmit -p tsconfig.json     # 或 pnpm run typecheck

# 构建产物（生成 lib/）
pnpm exec tsc -p tsconfig.json             # 或 pnpm run build
pnpm run clean                              # 删除 lib/
```

> **重要**：`tsc -b`（project references build）会污染主仓库 `packages/` 和 `vendor/` 的 `src/`
> 目录（输出 `*.d.ts/*.js/*.map`）。**避免** `tsc -b`！我们的 tsconfig.json 只用普通 `tsc`
> 编译本插件，`lib/` 输出到本地 `lib/`。

**已实测**（commit 时确认）：
- ✅ `tsc --noEmit` 类型检查通过（无错误，无产物）
- ✅ `tsc -p tsconfig.json` 编译通过（生成 `lib/index.{js,d.ts}` + source maps，2.3KB JS）
- ✅ `tsconfig.json` 使用 `references` 指向 `packages/skill/skill` 和 `vendor/cordis`，
  让 tsc 能解析跨包类型但只把本插件写到 `lib/`（不用 `-b` 就不会触发 packages/vendor 的编译）

### 配套仓库级 skill：`.agents/skills/dsh-poetry-poetricity/`

无需构建，直接可用。DSH agent 在仓库根目录会自动通过 skill 机制发现它。

### 集成状态

- ✅ 独立 Python harness
- ✅ 仓库级 skill
- ✅ 可发布的 TS skill provider（已通过 `tsc --noEmit` + `tsc` 双验证）