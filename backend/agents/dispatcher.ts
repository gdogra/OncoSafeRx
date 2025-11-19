import {
  AgentType,
  AgentContext,
  RunDDIAgentInput,
  RunDDIAgentOutput,
  RunDataQualityAgentInput,
  RunDataQualityAgentOutput,
  RunEvidenceAgentInput,
  RunEvidenceAgentOutput,
  RunPGxAgentInput,
  RunPGxAgentOutput,
} from './types.ts';

import { runDDIAgent } from './ddi.ts';
import { runDataQualityAgent } from './quality.ts';
import { runEvidenceAgent } from './evidence.ts';
import { runPGxAgent } from './pgx.ts';

export async function runAgent(
  agent_type: AgentType,
  payload: unknown,
  ctx: AgentContext,
): Promise<
  | RunDDIAgentOutput
  | RunDataQualityAgentOutput
  | RunEvidenceAgentOutput
  | RunPGxAgentOutput
> {
  switch (agent_type) {
    case 'DDI':
      return runDDIAgent(payload as RunDDIAgentInput, ctx);
    case 'DATA_QUALITY':
      return runDataQualityAgent(payload as RunDataQualityAgentInput, ctx);
    case 'EVIDENCE':
      return runEvidenceAgent(payload as RunEvidenceAgentInput, ctx);
    case 'PGX':
      return runPGxAgent(payload as RunPGxAgentInput, ctx);
    default:
      throw new Error(`Unsupported agent_type: ${agent_type}`);
  }
}

export type AgentOutputs =
  | RunDDIAgentOutput
  | RunDataQualityAgentOutput
  | RunEvidenceAgentOutput
  | RunPGxAgentOutput;

