// COLE AQUI A URL GERADA NO PASSO 8 DO APPS SCRIPT
const API_URL = "SUA_URL_DO_WEB_APP_AQUI"; 

const diasContainer = document.getElementById('dias-container');
const horariosPadrao = ["08:00 - 10:00", "16:00 - 18:00", "18:00 - 20:00", "20:00 - 22:00"]; // Adapte os blocos
let reservasAtuais = [];
let selecaoTemporaria = { data: "", horario: "" };

// Inicia o app
async function carregarDados() {
    diasContainer.innerHTML = "<p style='text-align:center'>Carregando agenda...</p>";
    try {
        const response = await fetch(API_URL);
        reservasAtuais = await response.json();
        renderizarDias();
    } catch (erro) {
        diasContainer.innerHTML = "<p>Erro ao carregar dados. Tente novamente.</p>";
    }
}

// Gera os próximos 7 dias limitando a janela
function renderizarDias() {
    diasContainer.innerHTML = "";
    const hoje = new Date();

    for (let i = 0; i < 7; i++) {
        const dataAtual = new Date(hoje);
        dataAtual.setDate(hoje.getDate() + i);
        const dataStr = dataAtual.toLocaleDateString('pt-BR'); // Ex: 05/04/2026
        
        // Formatação amigável (Ex: Segunda-feira, 05/04)
        const diaSemana = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' });
        const dataExibicao = `${diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1)}, ${dataStr}`;

        const card = document.createElement('div');
        card.className = 'dia-card';
        card.innerHTML = `<h3 class="dia-titulo">${dataExibicao}</h3>`;
        
        const grid = document.createElement('div');
        grid.className = 'horarios-grid';

        horariosPadrao.forEach(horario => {
            // Verifica na lista que veio da planilha se alguém já reservou
            const reserva = reservasAtuais.find(r => r.data === dataStr && r.horario === horario);
            
            const btn = document.createElement('button');
           if (reserva) {
                btn.className = 'btn-horario ocupado';
                btn.innerHTML = `<span>${horario}</span> <span>Casa ${reserva.casa}</span>`;
                btn.disabled = true;
            } else {
                btn.className = 'btn-horario disponivel';
                btn.innerHTML = `<span>${horario}</span> <span>Livre</span>`;
                btn.onclick = () => abrirModal(dataStr, horario);
            }
            grid.appendChild(btn);
        });

        card.appendChild(grid);
        diasContainer.appendChild(card);
    }
}

// Funções do Modal de Reserva
function abrirModal(data, horario) {
    selecaoTemporaria = { data, horario };
    document.getElementById('modal-info').innerText = `Data: ${data} | Horário: ${horario}`;
    document.getElementById('modal').classList.remove('escondido');
}

function fecharModal() {
    document.getElementById('modal').classList.add('escondido');
    document.getElementById('form-reserva').reset();
}

// Envio para o Google Sheets
document.getElementById('form-reserva').addEventListener('submit', async (e) => {
    e.preventDefault();
    
 const casa = document.getElementById('casa').value; // Atualizado o ID
    const nome = document.getElementById('nome').value;
    const btnConfirmar = document.querySelector('.btn-confirmar');
    
    btnConfirmar.innerText = "Salvando...";
    btnConfirmar.disabled = true;

    const payload = {
        data: selecaoTemporaria.data,
        horario: selecaoTemporaria.horario,
        casa: casa, // Atualizada a chave para enviar à planilha
        nome: nome
    };

    try {
        await fetch(API_URL, {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        fecharModal();
        carregarDados(); // Recarrega a tela para mostrar a nova reserva
    } catch (erro) {
        alert("Erro ao salvar. Verifique sua conexão.");
    } finally {
        btnConfirmar.innerText = "Reservar";
        btnConfirmar.disabled = false;
    }
});

carregarDados();