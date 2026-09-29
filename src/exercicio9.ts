import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import express, { NextFunction, Request, Response } from 'express';

interface RequestContext {
  requestId: string;
}

interface LogEntry {
  requestId: string;
  timestamp: string;
  message: string;
}

const requestContext = new AsyncLocalStorage<RequestContext>();
const logEntries: LogEntry[] = [];

function currentRequestId(): string {
  return requestContext.getStore()?.requestId ?? 'sem-request-id';
}

function log(message: string): void {
  const entry: LogEntry = {
    requestId: currentRequestId(),
    timestamp: new Date().toISOString(),
    message
  };
  logEntries.push(entry);
  console.log(`[${entry.requestId}] ${entry.timestamp} ${entry.message}`);
}

function requestIdMiddleware(request: Request, response: Response, next: NextFunction): void {
  const incomingId = request.header('x-request-id');
  const requestId = incomingId && /^[\w.-]{1,100}$/.test(incomingId) ? incomingId : randomUUID();
  response.setHeader('x-request-id', requestId);
  requestContext.run({ requestId }, () => {
    log('Requisição recebida');
    next();
  });
}

async function loadProfile(): Promise<{ user: string; loaded: boolean }> {
  await new Promise((resolve) => setTimeout(resolve, 25));
  log('Perfil carregado pelo serviço');
  return { user: 'Samuel', loaded: true };
}

const app = express();
app.use(requestIdMiddleware);

app.get('/perfil', async (_request, response) => {
  log('Iniciando consulta do perfil');
  const profile = await loadProfile();
  log('Finalizando consulta do perfil');
  response.json({ ...profile, requestId: currentRequestId() });
});

app.get('/logs/:requestId', (request, response) => {
  const matches = logEntries.filter((entry) => entry.requestId === request.params.requestId);
  response.json({ requestId: request.params.requestId, logs: matches });
});

app.get('/', (_request, response) => {
  response.json({ endpoints: ['/perfil', '/logs/:requestId'], header: 'x-request-id' });
});

const port = Number(process.env.PORT ?? 3009);
app.listen(port, () => {
  console.log(`Exercício 9 disponível em http://localhost:${port}`);
});
