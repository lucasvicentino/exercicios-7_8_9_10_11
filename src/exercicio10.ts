import assert from 'node:assert/strict';

interface Item {
  id: string;
  priceInCents: number;
  discountPercent: number;
}

const items: Item[] = [
  { id: 'livro', priceInCents: 3500, discountPercent: 15 },
  { id: 'caderno', priceInCents: 1200, discountPercent: 5 },
  { id: 'mochila', priceInCents: 8999, discountPercent: 20 }
];

function calculateWithOrderBug(itemsInOrder: readonly Item[]): number {
  let total = 0;

  for (const item of itemsInOrder) {
    total += item.priceInCents;
    const applied = Math.round(total * item.discountPercent / 100);
    total -= applied;
  }

  return total;
}

function calculateTotal(itemsInOrder: readonly Item[]): number {
  let total = 0;

  for (let index = 0; index < itemsInOrder.length; index += 1) {
    const item = itemsInOrder[index];
    const applied = Math.round(item.priceInCents * item.discountPercent / 100);
    const partial = item.priceInCents - applied;
    total += partial;
  }

  return total;
}

const buggyOriginalTotal = calculateWithOrderBug(items);
const buggyReversedTotal = calculateWithOrderBug([...items].reverse());
const originalTotal = calculateTotal(items);
const reversedTotal = calculateTotal([...items].reverse());
const shuffledTotal = calculateTotal([items[1], items[2], items[0]]);

assert.equal(reversedTotal, originalTotal);
assert.equal(shuffledTotal, originalTotal);
assert.notEqual(buggyOriginalTotal, buggyReversedTotal);

console.log(`Antes da correção, ordem original: R$ ${(buggyOriginalTotal / 100).toFixed(2)}`);
console.log(`Antes da correção, ordem inversa: R$ ${(buggyReversedTotal / 100).toFixed(2)}`);
console.log(`Total na ordem original: R$ ${(originalTotal / 100).toFixed(2)}`);
console.log(`Total na ordem inversa: R$ ${(reversedTotal / 100).toFixed(2)}`);
console.log(`Total em outra ordem: R$ ${(shuffledTotal / 100).toFixed(2)}`);
console.log('Validação concluída: a ordem dos itens não altera o total.');
