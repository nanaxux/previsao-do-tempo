// ============================================================
// 1. ELEMENTOS DO DOM
// ============================================================
const cidade = document.getElementById("cidade");
const botao = document.getElementById("buscar");
const nomeCidade = document.getElementById("nome-cidade");
const pais = document.getElementById("pais");
const temperatura = document.getElementById("temperatura");
const clima = document.getElementById("clima");
const umidade = document.getElementById("umidade");
const vento = document.getElementById("vento");
const direcaoVento = document.getElementById("direcao-vento");
const sensacao = document.getElementById("sensacao");
const visibilidade = document.getElementById("visibilidade");
const nascerSol = document.getElementById("nascer-sol");
const porSol = document.getElementById("por-sol");
const icone = document.getElementById("icone-clima");
const dataHora = document.getElementById("data-hora");
const loading = document.getElementById("loading");
const weatherContent = document.getElementById("weatherContent");
const welcomeMessage = document.getElementById("welcomeMessage");

// ============================================================
// 2. CHAVE DA API
// ============================================================
const chaveAPI = "73791d0778a3bc3bdc7d6b8c3dd1e0d3";

// ============================================================
// 3. FUNÇÕES AUXILIARES
// ============================================================

// 3.1 Converter direção do vento (graus para texto)
function converterDirecaoVento(graus) {
    const direcoes = [
        "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
        "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"
    ];
    const indice = Math.round(graus / 22.5) % 16;
    return direcoes[indice];
}

// 3.2 Formatar hora (timestamp para horário)
function formatarHora(timestamp, timezone) {
    const data = new Date(timestamp * 1000);
    const horas = data.getHours().toString().padStart(2, '0');
    const minutos = data.getMinutes().toString().padStart(2, '0');
    return `${horas}:${minutos}`;
}

// 3.3 Verificar se é dia ou noite
function verificarDiaNoite(nascer, por, timezone) {
    const agora = Math.floor(Date.now() / 1000);
    if (agora >= nascer && agora < por) {
        return 'dia';
    } else {
        return 'noite';
    }
}

// 3.4 Formatar data e hora atual
function atualizarDataHora() {
    const agora = new Date();
    const opcoes = {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return agora.toLocaleDateString('pt-BR', opcoes);
}

// ============================================================
// 4. MOSTRAR/ESCONDER ELEMENTOS
// ============================================================
function mostrarLoading(mostrar) {
    if (mostrar) {
        loading.style.display = "flex";
        weatherContent.style.display = "none";
        welcomeMessage.style.display = "none";
        removerErro();
    } else {
        loading.style.display = "none";
    }
}

function removerErro() {
    const erroExistente = document.querySelector(".erro-message");
    if (erroExistente) erroExistente.remove();
}

function mostrarErro(mensagem) {
    loading.style.display = "none";
    weatherContent.style.display = "none";
    welcomeMessage.style.display = "none";
    removerErro();

    const erroDiv = document.createElement("div");
    erroDiv.className = "erro-message";
    erroDiv.innerHTML = `❌ ${mensagem}`;
    document.getElementById("resultado").appendChild(erroDiv);
}

// ============================================================
// 5. FUNÇÃO PRINCIPAL - BUSCAR
// ============================================================
async function buscarCidade() {
    const cidadeValor = cidade.value.trim();

    if (!cidadeValor) {
        mostrarErro("Digite o nome de uma cidade!");
        return;
    }

    mostrarLoading(true);

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cidadeValor)}&appid=${chaveAPI}&lang=pt_br&units=metric`;

        const resposta = await fetch(url);
        const dados = await resposta.json();

        console.log(dados);

        if (dados.cod === 401) {
            mostrarErro("Chave API inválida!");
            return;
        }

        if (dados.cod === "404" || dados.cod === 404) {
            mostrarErro(`Cidade "${cidadeValor}" não encontrada!`);
            return;
        }

        if (dados.cod !== 200) {
            mostrarErro(`Erro: ${dados.message || "Algo deu errado"}`);
            return;
        }

        mostrarDados(dados);

    } catch (erro) {
        console.error(erro);
        mostrarErro("Erro ao conectar com a API. Verifique sua internet.");
    }
}

// ============================================================
// 6. MOSTRAR DADOS NA TELA
// ============================================================
function mostrarDados(dados) {
    // Remove erro se existir
    removerErro();

    // Dados principais
    nomeCidade.innerHTML = dados.name;
    pais.innerHTML = `📍 ${dados.sys.country}`;
    temperatura.innerHTML = `${Math.round(dados.main.temp)}°C`;
    clima.innerHTML = dados.weather[0].description;
    umidade.innerHTML = `${dados.main.humidity}%`;
    sensacao.innerHTML = `${Math.round(dados.main.feels_like)}°C`;

    // Vento com direção
    const velocidade = dados.wind.speed;
    const graus = dados.wind.deg || 0;
    const direcao = converterDirecaoVento(graus);
    vento.innerHTML = `${velocidade} m/s`;
    direcaoVento.innerHTML = `${direcao}`;

    // Visibilidade (km)
    const visibilidadeKm = (dados.visibility || 10000) / 1000;
    visibilidade.innerHTML = `${visibilidadeKm.toFixed(1)} km`;

    // Nascer e pôr do sol
    const timezone = dados.timezone;
    nascerSol.innerHTML = formatarHora(dados.sys.sunrise, timezone);
    porSol.innerHTML = formatarHora(dados.sys.sunset, timezone);

    // Ícone do clima
    icone.src = `https://openweathermap.org/img/wn/${dados.weather[0].icon}@4x.png`;

    // Data e hora atual
    dataHora.innerHTML = `🕐 ${atualizarDataHora()}`;

    // ============================================================
    // FUNDO MUDAR CONFORME DIA/NOITE
    // ============================================================
    const horaAtual = Math.floor(Date.now() / 1000);
    const nascer = dados.sys.sunrise;
    const por = dados.sys.sunset;

    if (horaAtual >= nascer && horaAtual < por) {
        document.body.className = 'dia';
    } else {
        document.body.className = 'noite';
    }

    // Mostrar conteúdo
    loading.style.display = "none";
    weatherContent.style.display = "block";
    welcomeMessage.style.display = "none";
}

// ============================================================
// 7. EVENTOS
// ============================================================

// Clique no botão
botao.addEventListener("click", buscarCidade);

// Pressionar Enter
cidade.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        buscarCidade();
    }
});

// ============================================================
// 8. INICIALIZAÇÃO
// ============================================================
console.log("🌤️ Previsão do Tempo carregada!");
console.log(`🔑 Tamanho da chave: ${chaveAPI.length} caracteres`);

// Verifica tamanho da chave
if (chaveAPI.length !== 32) {
    console.warn("⚠️ ATENÇÃO: A chave API deve ter 32 caracteres!");
}