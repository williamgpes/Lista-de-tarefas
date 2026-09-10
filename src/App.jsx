import { useState, useEffect } from "react";
import "./App.css";

const STORAGE_KEY = "lista-de-tarefas:itens";

// Cada tarefa é um objeto: { id, texto, concluida }
function criarTarefa(texto) {
  return {
    id: crypto.randomUUID(),
    texto,
    concluida: false,
  };
}

export default function App() {
  // useState guarda o estado da aplicação. Sempre que ele muda,
  // o React redesenha a tela automaticamente.
  const [tarefas, setTarefas] = useState(() => {
    // Lê do localStorage na primeira renderização, se já existir algo salvo.
    const salvas = localStorage.getItem(STORAGE_KEY);
    return salvas ? JSON.parse(salvas) : [];
  });
  const [novoTexto, setNovoTexto] = useState("");
  const [filtro, setFiltro] = useState("todas"); // "todas" | "ativas" | "concluidas"

  // useEffect roda toda vez que "tarefas" muda, e salva no localStorage.
  // É assim que a lista continua lá mesmo se você recarregar a página.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  }, [tarefas]);

  function adicionarTarefa(evento) {
    evento.preventDefault(); // evita recarregar a página ao enviar o formulário
    const texto = novoTexto.trim();
    if (!texto) return;
    setTarefas((atual) => [...atual, criarTarefa(texto)]);
    setNovoTexto("");
  }

  function alternarConcluida(id) {
    setTarefas((atual) =>
      atual.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, concluida: !tarefa.concluida } : tarefa
      )
    );
  }

  function removerTarefa(id) {
    setTarefas((atual) => atual.filter((tarefa) => tarefa.id !== id));
  }

  function limparConcluidas() {
    setTarefas((atual) => atual.filter((tarefa) => !tarefa.concluida));
  }

  // Move a tarefa uma posição para cima ou para baixo na lista.
  // direcao é -1 (sobe) ou 1 (desce).
  function moverTarefa(id, direcao) {
    setTarefas((atual) => {
      const indice = atual.findIndex((tarefa) => tarefa.id === id);
      const novoIndice = indice + direcao;

      // Não faz nada se já estiver no topo ou no fim da lista.
      if (novoIndice < 0 || novoIndice >= atual.length) return atual;

      const copia = [...atual];
      // Troca a tarefa de posição com a vizinha.
      [copia[indice], copia[novoIndice]] = [copia[novoIndice], copia[indice]];
      return copia;
    });
  }

  // Filtra a lista de acordo com a aba selecionada, sem alterar o estado original.
  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === "ativas") return !tarefa.concluida;
    if (filtro === "concluidas") return tarefa.concluida;
    return true;
  });

  const restantes = tarefas.filter((t) => !t.concluida).length;

  return (
    <div className="pagina">
      <main className="cartao">
        <header className="cabecalho">
          <h1>Lista de tarefas</h1>
          <p className="subtitulo">O que precisa ser feito hoje?</p>
        </header>

        <form className="formulario" onSubmit={adicionarTarefa}>
          <input
            type="text"
            placeholder="Adicionar uma tarefa..."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            aria-label="Nova tarefa"
          />
          <button type="submit">Adicionar</button>
        </form>

        <nav className="filtros">
          {[
            { chave: "todas", rotulo: "Todas" },
            { chave: "ativas", rotulo: "Ativas" },
            { chave: "concluidas", rotulo: "Concluídas" },
          ].map((opcao) => (
            <button
              key={opcao.chave}
              className={filtro === opcao.chave ? "filtro ativo" : "filtro"}
              onClick={() => setFiltro(opcao.chave)}
            >
              {opcao.rotulo}
            </button>
          ))}
        </nav>

        <ul className="lista">
          {tarefasFiltradas.length === 0 && (
            <li className="vazio">Nenhuma tarefa por aqui.</li>
          )}
          {tarefasFiltradas.map((tarefa) => (
            <li key={tarefa.id} className="item">
              <label>
                <input
                  type="checkbox"
                  checked={tarefa.concluida}
                  onChange={() => alternarConcluida(tarefa.id)}
                />
                <span className={tarefa.concluida ? "texto concluida" : "texto"}>
                  {tarefa.texto}
                </span>
              </label>
              <div className="acoes">
                {filtro === "todas" && (
                  <>
                    <button
                      className="mover"
                      onClick={() => moverTarefa(tarefa.id, -1)}
                      aria-label={`Mover "${tarefa.texto}" para cima`}
                    >
                      ↑
                    </button>
                    <button
                      className="mover"
                      onClick={() => moverTarefa(tarefa.id, 1)}
                      aria-label={`Mover "${tarefa.texto}" para baixo`}
                    >
                      ↓
                    </button>
                  </>
                )}
                <button
                  className="remover"
                  onClick={() => removerTarefa(tarefa.id)}
                  aria-label={`Remover "${tarefa.texto}"`}
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>

        <footer className="rodape">
          <span>
            {restantes} {restantes === 1 ? "tarefa restante" : "tarefas restantes"}
          </span>
          <button className="link" onClick={limparConcluidas}>
            Limpar concluídas
          </button>
        </footer>
      </main>
    </div>
  );
}
