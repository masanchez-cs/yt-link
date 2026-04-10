const { randomUUID } = require('crypto');

const jobs = new Map();
const MAX_BUFFER = 300;

function createJob(meta = {}) {
  const id = randomUUID();
  const job = {
    id,
    meta,
    buffer: [],
    clients: new Set(),
    status: 'queued',
    startedAt: Date.now(),
  };
  jobs.set(id, job);
  return job;
}

function getJob(id) {
  return jobs.get(id) || null;
}

function pushEvent(job, event) {
  job.buffer.push(event);
  if (job.buffer.length > MAX_BUFFER) {
    job.buffer.splice(0, job.buffer.length - MAX_BUFFER);
  }
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of job.clients) {
    try {
      res.write(payload);
    } catch {
      job.clients.delete(res);
    }
  }
}

function addSseClient(job, res) {
  job.clients.add(res);
  for (const event of job.buffer) {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  }
}

function removeSseClient(job, res) {
  job.clients.delete(res);
}

function completeJob(job, status) {
  job.status = status;
}

function deleteJobLater(id, ms = 60 * 60 * 1000) {
  setTimeout(() => {
    jobs.delete(id);
  }, ms);
}

module.exports = {
  createJob,
  getJob,
  pushEvent,
  addSseClient,
  removeSseClient,
  completeJob,
  deleteJobLater,
};
