# Exercícios 7 a 11

## Requisitos

Node.js 20 ou superior.

## Instalação

Execute `npm install` na pasta do projeto.

## Execução

- `npm run exercicio:7`: leitura JSON assíncrona, classificação de erros, fetch com URL inválida e resposta 404, e captura de rejeição global.
- `npm run exercicio:8`: inicia o servidor Express na porta 3008. Teste `/nao-encontrado` e `/erro-interno`.
- `npm run exercicio:9`: inicia o servidor com AsyncLocalStorage na porta 3009. Consulte `/perfil`; o ID também pode ser enviado em `x-request-id`. Consulte `/logs/ID` para filtrar as linhas daquele identificador.
- `npm run exercicio:10`: calcula os totais em ordens diferentes e valida que permanecem iguais.
- `npm run exercicio:11`: compara as medições de memória antes e depois de limitar o cache, remover listeners executados e limpar o temporizador.
- `npm run typecheck`: verifica os tipos TypeScript.

## Depuração do exercício 10

Abra a configuração `Depurar exercício 10` no painel Run and Debug e inicie a depuração. Coloque um breakpoint dentro do `for` em `src/exercicio10.ts`. No painel Watch, adicione `total`, `applied`, `index` e `partial` para observar cada iteração. O desconto é calculado sobre o preço original de cada item e acumulado em centavos, sem depender da ordem.
