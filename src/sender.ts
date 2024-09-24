import {
  batchMutation,
  FarosClient,
  Mutation,
  QueryBuilder,
} from "faros-js-client";
import { AutoCompletionEvent } from "./types";
import { farosConfig } from "./config";
import { config } from "process";

async function* mutations(
  events: AutoCompletionEvent[]
): AsyncGenerator<Mutation> {
  // The QueryBuilder manages the origin for you
  const qb = new QueryBuilder(farosConfig.origin());

  const vcs_User = {
    uid: farosConfig.vcsUid(),
    name: farosConfig.vcsName(),
    email: farosConfig.vcsEmail(),
  };
  yield qb.upsert({ vcs_User });

  const vcs_UserTool = {
    tool: 
    {
        category: "AutoCompletion"
    },
    user: qb.ref({ vcs_User }),
  };
  yield qb.upsert({ vcs_UserTool });

  for (const event of events) {
    const vcs_UserToolUsage = {
      usedAt: event.timestamp.toISOString(),
      userTool: qb.ref({ vcs_UserTool }),
    };
    yield qb.upsert({ vcs_UserToolUsage });
  }
}

async function sendToFaros(
  faros: FarosClient,
  graph: string,
  batch: Mutation[]
): Promise<void> {
  console.log(`Sending...`);
  await faros.sendMutations(graph, batch);
  console.log(`Done.`);
}

async function sendToWebhook(
  webhook: string,
  batch: Mutation[]
): Promise<void> {
  console.log(`Sending...`);
  await fetch(webhook, {
    method: "POST",
    body: JSON.stringify(batch),
  });
}

export async function send(events: AutoCompletionEvent[]): Promise<void> {
  let sendFn;
  if (farosConfig.webhook() === '') {
    const faros = new FarosClient({
      url: farosConfig.url(),
      apiKey: farosConfig.apiKey(),
    });
    sendFn = (batch: Mutation[]) => sendToFaros(faros, farosConfig.graph(), batch);
  }
  else {
    sendFn = (batch: Mutation[]) => sendToWebhook(farosConfig.webhook(), batch);
  }

  let batchNum = 1;
  let batch: Mutation[] = [];
  for await (const mutation of mutations(events)) {
    if (batch.length >= farosConfig.batchSize()) {
      console.log(`------ Batch ${batchNum} - Size: ${batch.length} ------`);
      await sendFn(batch);
      batchNum++;
      batch = [];
    }
    batch.push(mutation);
  }

  if (batch.length > 0) {
    console.log(`------ Batch ${batchNum} - Size: ${batch.length} ------`);
    await sendFn(batch);
  }
}
