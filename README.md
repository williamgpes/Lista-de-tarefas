# Lista de Tarefas

Aplicação simples de lista de tarefas (to-do list) feita em React + Vite, como projeto de estudo/portfólio.

## Funcionalidades

- Adicionar tarefa
- Marcar como concluída
- Remover tarefa
- Filtrar por Todas / Ativas / Concluídas
- Contador de tarefas restantes
- Os dados ficam salvos no navegador (localStorage) — a lista continua lá mesmo se você fechar a aba

## Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org/) instalado (versão 18 ou superior).

```bash
npm install
npm run dev
```

Depois é só abrir o endereço que aparecer no terminal (geralmente `http://localhost:5173`).

## Estrutura do projeto

```
src/
  App.jsx      -> componente principal, com toda a lógica da lista
  App.css      -> estilos do componente
  main.jsx     -> ponto de entrada do React
  index.css    -> estilos globais
index.html
package.json
```

## Tecnologias

- React
- Vite
- CSS puro (sem framework de estilo)

## Próximos passos (ideias para evoluir o projeto)

- Editar o texto de uma tarefa já criada
- Reordenar tarefas (drag and drop)
- Salvar em um backend em vez de localStorage
