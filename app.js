console.log("Sistema de busca de músicas iniciado...");

// =========================================================================
// ⚠️ COLE O ID DA SUA PLANILHA DENTRO DAS ASPAS ABAIXO:
const SPREADSHEET_ID = "1-2ohsF5WYtF7AgTT6SeB82BSEgynOqxZp27bJcEOHcQ";
// =========================================================================

const searchForm = document.getElementById('searchForm');
const resultsDiv = document.getElementById('results');

let todasAsMusicas = []; // Guarda a lista completa vinda do Google
let filtroTempo = 'todos';
let filtroParte = 'todos';

// Carrega os dados da planilha assim que a página abre
async function carregarDadosIniciais() {
    resultsDiv.innerHTML = "<p class='status-msg'>Carregando acervo sagrado...</p>";
    const url = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        const linhas = data.table.rows;
        
        todasAsMusicas = linhas.map(linha => {
            const celulas = linha.c || [];
            return {
                musica: celulas[0] && celulas[0].v ? String(celulas[0].v) : '',
                parte:  celulas[1] && celulas[1].v ? String(celulas[1].v) : '',
                ano:    celulas[2] && celulas[2].v ? String(celulas[2].v) : '',
                tempo:  celulas[3] && celulas[3].v ? String(celulas[3].v) : '',
                link:   celulas[4] && celulas[4].v ? String(celulas[4].v) : '',
                cifra:  celulas[5] && celulas[5].v ? String(celulas[5].v) : ''
            };
        });

        // Remove a primeira linha caso ela seja o cabeçalho (musica, parte, etc.)
        if (todasAsMusicas.length > 0 && todasAsMusicas[0].musica.toLowerCase() === 'musica') {
            todasAsMusicas.shift();
        }

        renderizarMusicas(todasAsMusicas);

    } catch (error) {
        console.error(error);
        resultsDiv.innerHTML = "<p class='status-msg error'>Erro ao conectar com a planilha. Verifique a internet e o compartilhamento.</p>";
    }
}

// Função responsável por filtrar e renderizar na tela
function aplicarFiltrosEBusca() {
    const searchTerm = document.getElementById('search').value.toLowerCase().trim();

    const filtradas = todasAsMusicas.filter(item => {
        const bateBusca = !searchTerm || (item.musica && item.musica.toLowerCase().includes(searchTerm));
        const bateTempo = filtroTempo === 'todos' || (item.tempo && item.tempo.toLowerCase().trim() === filtroTempo);
        const bateParte = filtroParte === 'todos' || (item.parte && item.parte.toLowerCase().trim() === filtroParte);
        
        return bateBusca && bateTempo && bateParte;
    });

    renderizarMusicas(filtradas);
}

function renderizarMusicas(lista) {
    resultsDiv.innerHTML = "";

    if (lista.length === 0) {
        resultsDiv.innerHTML = "<p class='status-msg'>Nenhuma música encontrada com os filtros selecionados.</p>";
        return;
    }

    lista.forEach(musica => {
        const linkVideo = musica.link ? musica.link.replace(/#/g, '') : '';
        const linkCifra = musica.cifra ? musica.cifra.replace(/#/g, '') : '';

        resultsDiv.innerHTML += `
            <div class="card-musica">
                <div class="card-body">
                    <h3>${musica.musica}</h3>
                    <div class="badges">
                        <span class="badge parte">${musica.parte || 'Não informado'}</span>
                        <span class="badge tempo">${musica.tempo || 'Não informado'}</span>
                        ${musica.ano ? `<span class="badge ano">Ano ${musica.ano}</span>` : ''}
                    </div>
                </div>
                <div class="card-actions">
                    ${linkVideo ? `<a href="${linkVideo}" target="_blank" class="btn-action youtube">▶ Audio/Video</a>` : ''}
                    ${linkCifra ? `<a href="${linkCifra}" target="_blank" class="btn-action cifra">🎵 Cifra</a>` : ''}
                </div>
            </div>
        `;
    });
}

// Evento do formulário de busca
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    aplicarFiltrosEBusca();
});

// Configuração dos cliques nos botões de filtro
document.querySelectorAll('.filter-btn').forEach(botao => {
    botao.addEventListener('click', (e) => {
        const tipoFiltro = e.target.getAttribute('data-filter');
        const valor = e.target.getAttribute('data-value').toLowerCase().trim();

        // Remove a classe ativa dos outros botões do mesmo bloco
        document.querySelectorAll(`.filter-btn[data-filter="${tipoFiltro}"]`).forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');

        if (tipoFiltro === 'tempo') filtroTempo = valor;
        if (tipoFiltro === 'parte') filtroParte = valor;

        aplicarFiltrosEBusca();
    });
});

// Inicializa o sistema ao carregar a página
carregarDadosIniciais();
