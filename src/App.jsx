import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import "./App.css";

const STORAGE_KEY = "lista-de-tarefas:itens";

// Cada tarefa é um objeto: { id, texto, concluida, prioridade }
function criarTarefa(texto, prioridade) {
  return {
    id: crypto.randomUUID(),
    texto,
    concluida: false,
    prioridade, // "alta" | "media" | "baixa"
  };
}

const PRIORIDADES = {
  alta: { rotulo: "Alta", cor: "#c0392b", peso: 0 },
  media: { rotulo: "Média", cor: "#c98a3e", peso: 1 },
  baixa: { rotulo: "Baixa", cor: "#4c7a5c", peso: 2 },
};

export default function App() {
  // useState guarda o estado da aplicação. Sempre que ele muda,
  // o React redesenha a tela automaticamente.
  const [tarefas, setTarefas] = useState(() => {
    // Lê do localStorage na primeira renderização, se já existir algo salvo.
    const salvas = localStorage.getItem(STORAGE_KEY);
    if (!salvas) return [];
    // Tarefas criadas antes dessa funcionalidade não têm "prioridade" salva,
    // então aqui garantimos um valor padrão pra elas não quebrarem a tela.
    return JSON.parse(salvas).map((tarefa) => ({
      prioridade: "media",
      ...tarefa,
    }));
  });
  const [novoTexto, setNovoTexto] = useState("");
  const [novaPrioridade, setNovaPrioridade] = useState("media");
  const [filtro, setFiltro] = useState("todas"); // "todas" | "ativas" | "concluidas"
  const [ordenarPorPrioridade, setOrdenarPorPrioridade] = useState(false);

  // useEffect roda toda vez que "tarefas" muda, e salva no localStorage.
  // É assim que a lista continua lá mesmo se você recarregar a página.
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tarefas));
  }, [tarefas]);

  function adicionarTarefa(evento) {
    evento.preventDefault(); // evita recarregar a página ao enviar o formulário
    const texto = novoTexto.trim();
    if (!texto) return;
    setTarefas((atual) => [...atual, criarTarefa(texto, novaPrioridade)]);
    setNovoTexto("");
    setNovaPrioridade("media");
  }

  // Muda a prioridade de uma tarefa já existente.
  function mudarPrioridade(id, prioridade) {
    setTarefas((atual) =>
      atual.map((tarefa) =>
        tarefa.id === id ? { ...tarefa, prioridade } : tarefa
      )
    );
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
  let tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtro === "ativas") return !tarefa.concluida;
    if (filtro === "concluidas") return tarefa.concluida;
    return true;
  });

  if (ordenarPorPrioridade) {
    // .slice() cria uma cópia antes de ordenar, pra não alterar o array original.
    // Tarefas com a mesma prioridade mantêm a ordem em que foram criadas.
    tarefasFiltradas = tarefasFiltradas
      .slice()
      .sort((a, b) => PRIORIDADES[a.prioridade].peso - PRIORIDADES[b.prioridade].peso);
  }

  const restantes = tarefas.filter((t) => !t.concluida).length;
  const total = tarefas.length;
  const concluidas = total - restantes;
  const percentualConcluido = total === 0 ? 0 : Math.round((concluidas / total) * 100);

  return (
    <div className="pagina">
      <main className="cartao">
        <header className="cabecalho">
          <h1>Lista de tarefas</h1>
          <p className="subtitulo">O que precisa ser feito hoje?</p>
        </header>

        {total > 0 && (
          <div className="progresso" role="progressbar" aria-valuenow={percentualConcluido} aria-valuemin={0} aria-valuemax={100}>
            <div className="progresso-trilha">
              <div className="progresso-barra" style={{ width: `${percentualConcluido}%` }} />
            </div>
            <span className="progresso-rotulo">{percentualConcluido}% concluído</span>
          </div>
        )}

        <form className="formulario" onSubmit={adicionarTarefa}>
          <input
            type="text"
            placeholder="Adicionar uma tarefa..."
            value={novoTexto}
            onChange={(e) => setNovoTexto(e.target.value)}
            aria-label="Nova tarefa"
          />
          <select
            value={novaPrioridade}
            onChange={(e) => setNovaPrioridade(e.target.value)}
            aria-label="Prioridade da nova tarefa"
            className="select-prioridade"
          >
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
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
          <button
            className={ordenarPorPrioridade ? "filtro ativo ordenar" : "filtro ordenar"}
            onClick={() => setOrdenarPorPrioridade((atual) => !atual)}
          >
            Ordenar por prioridade
          </button>
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
                <span
                  className="bolinha-prioridade"
                  style={{ backgroundColor: PRIORIDADES[tarefa.prioridade].cor }}
                  title={`Prioridade ${PRIORIDADES[tarefa.prioridade].rotulo}`}
                />
                <span className={tarefa.concluida ? "texto concluida" : "texto"}>
                  {tarefa.texto}
                </span>
              </label>
              <div className="acoes">
                <select
                  className="select-prioridade select-prioridade-item"
                  value={tarefa.prioridade}
                  onChange={(e) => mudarPrioridade(tarefa.id, e.target.value)}
                  aria-label={`Prioridade de "${tarefa.texto}"`}
                >
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
                {filtro === "todas" && !ordenarPorPrioridade && (
                  <>
                    <button
                      className="mover"
                      onClick={() => moverTarefa(tarefa.id, -1)}
                      aria-label={`Mover "${tarefa.texto}" para cima`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      className="mover"
                      onClick={() => moverTarefa(tarefa.id, 1)}
                      aria-label={`Mover "${tarefa.texto}" para baixo`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </>
                )}
                <button
                  className="remover"
                  onClick={() => removerTarefa(tarefa.id)}
                  aria-label={`Remover "${tarefa.texto}"`}
                >
                  <X size={17} />
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
