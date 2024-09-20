import {
  batchMutation,
  FarosClient,
  Mutation,
  QueryBuilder,
} from "faros-js-client";
import { AutoCompletionEvent } from "./types";
import { farosConfig } from "./config";

const faros_api_url = farosConfig.url;
const faros_api_key = farosConfig.apiKey;
const graph = farosConfig.graph;
const origin = farosConfig.origin;
const maxBatchSize = farosConfig.batchSize;
const vcs_uid = farosConfig.vcsUid;

async function* mutations(
  events: AutoCompletionEvent[]
): AsyncGenerator<Mutation> {
  // The QueryBuilder manages the origin for you
  const qb = new QueryBuilder(origin);

  const vcs_User = {
    uid: vcs_uid,
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

export async function send(events: AutoCompletionEvent[]): Promise<void> {
  const faros = new FarosClient({
    url: faros_api_url,
    apiKey: faros_api_key,
  });

  let batchNum = 1;
  let batch: Mutation[] = [];
  for await (const mutation of mutations(events)) {
    if (batch.length >= maxBatchSize) {
      console.log(`------ Batch ${batchNum} - Size: ${batch.length} ------`);
      await sendToFaros(faros, graph, batch);
      batchNum++;
      batch = [];
    }
    batch.push(mutation);
  }

  if (batch.length > 0) {
    console.log(`------ Batch ${batchNum} - Size: ${batch.length} ------`);
    await sendToFaros(faros, graph, batch);
  }
}
