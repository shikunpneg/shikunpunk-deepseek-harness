# Poetry-Poetricity Harness (DSH skill body)

中文诗歌「诗歌性」自动评测 harness。4 个子 Agent 组成的探索闭环。

## When to use

- 探索「诗歌/非诗歌」自动评测指标（与人类判断的一致性）
- 评估指标在 AI 仿诗上的失效边界
- 生成 AI 仿诗作为困难样本（阶段 2）

## How to invoke

The Python harness lives at `research/poetry-poetricity-harness/`. Drive it via
`dsh-subprocess` or direct CLI:

```bash
# 1) 自测（4 子 Agent + 越界检测）
python research/poetry-poetricity-harness/harness.py

# 2) 真实 v2 指标评估（val kappa ≈ 0.93）
python research/poetry-poetricity-harness/run_harness.py --rounds 2 --model v2

# 3) 指标组合探索（ExplorerAgent 闭环）
python research/poetry-poetricity-harness/run_harness.py --rounds 5 --model v2
```

## Sub-agents

| Agent | Role | Contract |
|---|---|---|
| Explorer | 指标组合搜索（§3.1 阶段 1）| proposes feature combos, evaluates kappa |
| Generator | AI 仿诗动态提难（§3.1 阶段 2）| raises similarity, collects hard samples |
| Check | 数据边界/规则审计（§2.1）| flags OUT-OF-BOUNDS → INVALID |
| Memory | 日志/失败/规则（§2.3）| writes harness_round_<NNN>.json |

## Data boundary (AccessGate)

- READ whitelist: `E:\生成诗歌\{poetry-judge-train\data\samples, eval-annotation\data, ChineseHardJudgePoem\data, eval-annotation\backups}`
- WRITE whitelist: `E:\ai4s\poetry-poetricity\{04_memory, 05_experiments, 06_artifacts}`
- Violation → AccessViolation → CheckAgent marks round INVALID

## Evaluation protocol (immutable)

- Fixed val split: `train_val_split(seed=42, val_ratio=0.2)`
- Metrics: Quadratic Kappa / Accuracy / F1 macro
- Test split NEVER visible.

## Artifacts

- Round logs: `E:\ai4s\poetry-poetricity\04_memory\experiment_logs\harness_round_<NNN>.json`
- Failure samples: `04_memory\failures\harness_round_<NNN>.jsonl`
- Violation rules: `04_memory\rules_memory\`

## Linked repo

Full project (metrics/logs/paper): https://github.com/shikunpneg/ChinesePoemBenchmark
