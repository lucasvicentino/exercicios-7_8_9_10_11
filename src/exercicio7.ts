import { readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createServer } from 'node:http';

class AppError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'AppError';
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

async function readJsonFile(filePath: string): Promise<unknown> {
  try {
    const contents = await readFile(filePath, 'utf8');
    return JSON.parse(contents) as unknown;
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new AppError('Arquivo não encontrado.', 404);
    }
    if (error instanceof SyntaxError) {
      throw new AppError('O arquivo contém JSON inválido.', 500);
    }
    throw error;
  }
}

function describeError(error: unknown): string {
  if (error instanceof AppError) {
    return `HTTP ${error.statusCode}: ${error.message}`;
  }
  if (error instanceof Error) {
    return `Erro inesperado: ${error.message}`;
  }
  return 'Erro inesperado não identificado.';
}

async function testFetch(): Promise<void> {
  try {
    await fetch('http://[url-invalida');
  } catch (error: unknown) {
    console.log('URL inválida capturada:', describeError(error));
  }

  const server = createServer((_request, response) => {
    response.writeHead(404, { 'content-type': 'application/json' });
    response.end(JSON.stringify({ message: 'Não encontrado' }));
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('Não foi possível iniciar o servidor de teste.');
  }

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/recurso`);
    if (!response.ok) {
      console.log(`Resposta HTTP capturada: ${response.status} ${response.statusText}`);
    }
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

process.on('unhandledRejection', (reason: unknown) => {
  console.error('Rejeição global não tratada capturada:', describeError(reason));
});

async function main(): Promise<void> {
  const corruptedFile = join(tmpdir(), `exercicio7-${process.pid}.json`);
  await writeFile(corruptedFile, '{ json quebrado', 'utf8');

  for (const filePath of [join(tmpdir(), `inexistente-${process.pid}.json`), corruptedFile]) {
    try {
      await readJsonFile(filePath);
    } catch (error: unknown) {
      console.log(describeError(error));
    }
  }

  await unlink(corruptedFile);
  await testFetch();
  void Promise.reject(new Error('Rejeição de demonstração'));
  await new Promise((resolve) => setImmediate(resolve));
}

void main().catch((error: unknown) => {
  console.error('Falha ao executar o exercício:', describeError(error));
  process.exitCode = 1;
});
