import express, { ErrorRequestHandler, Request, Response, NextFunction } from 'express';

class HttpError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'HttpError';
  }
}

function asyncRoute(
  handler: (request: Request, response: Response, next: NextFunction) => Promise<unknown>
) {
  return (request: Request, response: Response, next: NextFunction): void => {
    void handler(request, response, next).catch(next);
  };
}

const app = express();
app.use(express.json());

app.get('/nao-encontrado', asyncRoute(async () => {
  throw new HttpError('O recurso solicitado não foi encontrado.', 404);
}));

app.get('/erro-interno', asyncRoute(async () => {
  throw new Error('Detalhe interno que não deve ser enviado ao cliente.');
}));

app.get('/', (_request, response) => {
  response.json({ message: 'Acesse /nao-encontrado ou /erro-interno para testar.' });
});

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  const knownError = error instanceof HttpError;
  const statusCode = knownError ? error.statusCode : 500;
  const message = knownError ? error.message : 'Ocorreu um erro interno.';

  if (!knownError) {
    const stack = error instanceof Error ? error.stack : String(error);
    console.error('Erro interno da aplicação:', stack);
  }

  response.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString()
  });
};

app.use(errorHandler);

const port = Number(process.env.PORT ?? 3008);
app.listen(port, () => {
  console.log(`Exercício 8 disponível em http://localhost:${port}`);
});
