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
    let vcs_Repository = null;
    let vcs_Branch = null;

    if (event.repository) {
      vcs_Repository = {
        name: event.repository,
      };
      yield qb.upsert({ vcs_Repository });

      if (event.branch) {
        vcs_Branch = {
          name: event.branch,
          repository: qb.ref({ vcs_Repository }),
        };
        yield qb.upsert({ vcs_Branch });
      }
    }

    let vcs_File = null;
    if (event.filename) {
      vcs_File = {
        path: event.filename,
        extension: event.extension || event.language,
        uid: event.filename,
      };
      yield qb.upsert({ vcs_File });
    }

    const vcs_UserToolUsage = {
      usedAt: event.timestamp instanceof Date ? event.timestamp.toISOString() : event.timestamp,
      userTool: qb.ref({ vcs_UserTool }),
      charactersAdded: event.autoCompletionCharCountChange,
    };

    if (vcs_Repository) {
      (vcs_UserToolUsage as any).repository = qb.ref({ vcs_Repository });
    }
    if (vcs_Branch) {
      (vcs_UserToolUsage as any).branch = qb.ref({ vcs_Branch });
    }
    if (vcs_File) {
      (vcs_UserToolUsage as any).file = qb.ref({ vcs_File });
    }

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
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: batchMutation(batch) }),
  });
}

async function debug(batch: Mutation[]): Promise<void> {
  console.log(batchMutation(batch));
}

export async function send(events: AutoCompletionEvent[]): Promise<void> {
  let sendFn;
  if (farosConfig.webhook() !== '') {
    sendFn = (batch: Mutation[]) => sendToWebhook(farosConfig.webhook(), batch);
  } else if (farosConfig.graph() !== '' && farosConfig.apiKey() !== '' && farosConfig.url() !== '') {
    const faros = new FarosClient({
      url: farosConfig.url(),
      apiKey: farosConfig.apiKey(),
    });
    sendFn = (batch: Mutation[]) => sendToFaros(faros, farosConfig.graph(), batch);
  } else {
    sendFn = (batch: Mutation[]) => debug(batch);
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
