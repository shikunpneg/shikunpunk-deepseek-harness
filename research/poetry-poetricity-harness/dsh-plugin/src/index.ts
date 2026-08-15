/**
 * DSH skill provider: bridges the AI4S Chinese-poetry poeticity harness
 * (Python, research/poetry-poetricity-harness) into DSH as a model-invocable
 * skill.
 *
 * The Python harness is the executor; this provider publishes the skill so a
 * DSH agent knows WHEN and HOW to drive it (via `dsh-subprocess` or direct
 * CLI). Provider registration mirrors `packages/skill/skill-badge`.
 *
 * @module @shikunpneg/dsh-poetry-poetricity
 */

import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import {
  BUNDLED_SKILL_RANK,
  type SkillCandidate,
  type SkillDefinition,
  type SkillProvider,
} from '@deepseek-ai/dsh-skill'

const PROVIDER_NAME = 'poetry-poetricity'
const SKILL_BODY_URL = new URL('../SKILL.md', import.meta.url)
const RESOURCE_BASE = {
  kind: 'directory',
  path: fileURLToPath(new URL('../', import.meta.url)),
} as const
const INVOCATION = { modelInvocable: true, userInvocable: true } as const
const DESCRIPTION =
  'Run the AI4S Chinese-poetry "poeticity" metric exploration harness: 4 sub-agents ' +
  '(Explorer/Generator/Check/Memory) driving the indicator-combination search loop, ' +
  'AI-poem difficulty escalation, data-boundary auditing, and experiment memory. ' +
  'Use when exploring poeticity metrics, evaluating metric-vs-human consistency, ' +
  'or generating AI-imitation poems for the poetry benchmark.'
const CANDIDATE: SkillCandidate = {
  name: 'poetry-poetricity',
  description: DESCRIPTION,
  invocation: INVOCATION,
  provider: PROVIDER_NAME,
  source: 'bundled',
  resourceBase: RESOURCE_BASE,
  rank: BUNDLED_SKILL_RANK,
  locator: SKILL_BODY_URL,
}

const provider: SkillProvider = {
  name: PROVIDER_NAME,
  list: () => Promise.resolve([CANDIDATE]),
  async get(_candidate): Promise<SkillDefinition> {
    return {
      name: CANDIDATE.name,
      description: CANDIDATE.description,
      invocation: CANDIDATE.invocation,
      provider: CANDIDATE.provider,
      source: CANDIDATE.source,
      resourceBase: RESOURCE_BASE,
      content: await readFile(SKILL_BODY_URL, 'utf8'),
    }
  },
}

/** Cordis plugin name. */
export const name = 'poetry-poetricity'
/** Services required by the provider. */
export const inject = ['skills']

/** Register the bundled provider on `ctx.skills`. */
export function apply(ctx: Context): void {
  ctx.skills.registerProvider(() => provider)
}
