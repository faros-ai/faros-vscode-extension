import {
  batchMutation,
  FarosClient,
  Mutation,
  QueryBuilder,
} from "faros-js-client";
import { AutoCompletionEvent } from "./types";
import * as vscode from "vscode";
import gitUserName from "git-user-name";
import gitUserEmail from "git-user-email";

const config = vscode.workspace.getConfiguration('faros');
const faros_api_url = config.get<string>('url') || "https://prod.api.faros.ai";
const faros_api_key = config.get<string>('apiKey') || "<key>";
const graph = config.get<string>('graph') || "default";
const origin = config.get<string>('origin') || 'faros-vscode-extension';
const maxBatchSize = Number(config.get<string>('batchSize')) || 500;
const vcs_uid = config.get<string>('vcsUid') || gitUserName() || gitUserEmail();

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
  console.log("Faros API URL:", faros_api_url);
  console.log("Faros API Key:", faros_api_key);
  console.log("Graph:", graph);
  console.log("Origin:", origin);
  console.log("Max Batch Size:", maxBatchSize);
  console.log("VCS UID:", vcs_uid);
  console.log('Mutation:', batchMutation(batch));
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
