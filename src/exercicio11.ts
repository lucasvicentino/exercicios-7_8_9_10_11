interface SimulationOptions {
  label: string;
  bounded: boolean;
  iterations: number;
}

interface RetainedRecord {
  values: Array<{ iteration: number; value: number }>;
}

function formatMegabytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function collectGarbage(): void {
  const exposedGc = (globalThis as typeof globalThis & { gc?: () => void }).gc;
  exposedGc?.();
}

async function simulate({ label, bounded, iterations }: SimulationOptions): Promise<void> {
  const cache = new Map<number, RetainedRecord>();
  const listeners = new Set<() => void>();
  const timer = setInterval(() => {
    for (const listener of listeners) {
      listener();
      if (bounded) {
        listeners.delete(listener);
      }
    }
  }, 10);

  console.log(`${label}: início ${formatMegabytes(process.memoryUsage().heapUsed)}`);

  try {
    for (let iteration = 1; iteration <= iterations; iteration += 1) {
      const record: RetainedRecord = {
        values: Array.from({ length: 512 }, (_, value) => ({ iteration, value }))
      };
      cache.set(iteration, record);
      const listener = () => record.values.length;
      listeners.add(listener);

      if (bounded && cache.size > 100) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey !== undefined) {
          cache.delete(oldestKey);
        }
      }

      if (iteration % 200 === 0) {
        collectGarbage();
        console.log(
          `${label}: iteração ${iteration}, heap ${formatMegabytes(process.memoryUsage().heapUsed)}, cache ${cache.size}, listeners ${listeners.size}`
        );
      }

      if (iteration % 25 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }
  } finally {
    clearInterval(timer);
    listeners.clear();
    cache.clear();
    collectGarbage();
    console.log(`${label}: após limpeza ${formatMegabytes(process.memoryUsage().heapUsed)}`);
  }
}

async function main(): Promise<void> {
  await simulate({ label: 'Antes da correção', bounded: false, iterations: 1200 });
  await simulate({ label: 'Depois da correção', bounded: true, iterations: 1200 });
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Falha na simulação.');
  process.exitCode = 1;
});
