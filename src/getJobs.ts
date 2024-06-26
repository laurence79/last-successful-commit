import * as core from '@actions/core';
import { ApiType } from './ApiType';

const PAGE_SIZE = 50;

async function* getJobs(
  api: ApiType,
  owner: string,
  repo: string,
  runId: number,
  page = 1
) {
  const from = (page - 1) * PAGE_SIZE + 1;
  const to = page * PAGE_SIZE;

  core.debug(
    `Loading jobs ${from} to ${to} for workflow run ${runId} in ${owner}/${repo} `
  );

  const result = await api.request(
    'GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs',
    {
      owner,
      repo,
      run_id: runId,
      per_page: PAGE_SIZE
    }
  );

  for (const element of result.data.jobs) {
    core.info(`Job ${element.name} (${element.conclusion})`);
    core.debug(JSON.stringify(element, null, 2));
    yield element;
  }

  if (result.data.jobs.length === PAGE_SIZE) {
    return getJobs(api, owner, repo, runId, page + 1);
  }
}

export default getJobs;
