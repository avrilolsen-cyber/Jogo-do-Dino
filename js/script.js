const DINOS = [
    { emoji: "🦕", name: "Braquio" },
    { emoji: "🦖", name: "T-Rex" },
    { emoji: "🐉", name: "Dragão" },
    { emoji: "🦎", name: "Iguana" },
    { emoji: "🐊", name: "Crocosso" },
    { emoji: "🦴", name: "Osso" },
    { emoji: "🥚", name: "Dinovo" },
    { emoji: "🌋", name: "Vulcano" },
    { emoji: "🍃", name: "Folhasso" },
    { emoji: "⚡", name: "Rapto" },
    { emoji: "🌿", name: "Estego" },
    ];
    const PRIZE_LIMIT = 500;
    let totalArrecadado = 0;
    let totalPremios = 0;
    let selectedDino = null;
    let freeRound = false;
    let lastBet = 0;
    let gameOver = false;

function fmt(v) { return "R\$ " + v.toFixed(2).replace('.', ','); } 

function renderDinos() { 
    const grid = document.getElementById('dinos-grid'); 
    grid.innerHTML = ''; 
    DINOS.forEach((d, i) => { 
        const btn = document.createElement('button'); 
        btn.className = 'dino-btn' + (selectedDino === i ? ' selected' : ''); 
        btn.innerHTML = `${d.emoji}<span>${d.name}</span>`; 
        btn.onclick = () => { selectedDino = i; renderDinos(); }; 
        grid.appendChild(btn); 
    }); 
} 

function updateStats() { 
    document.getElementById('stat-arrecadado').textContent = fmt(totalArrecadado); 
    document.getElementById('stat-premios').textContent = fmt(totalPremios); 
    document.getElementById('stat-limite').textContent = fmt(Math.max(0, PRIZE_LIMIT - totalPremios)); 
    const pct = Math.min(100, (totalPremios / PRIZE_LIMIT) * 100); 
    document.getElementById('limit-bar').style.width = pct + '%'; 
    document.getElementById('limit-pct').textContent = pct.toFixed(0) + '%'; 
    if (pct >= 100) { document.getElementById('limit-bar').style.background = '#e24b4a'; } 
} 

function escolherAleatorio() { 
    selectedDino = Math.floor(Math.random() * DINOS.length); 
    renderDinos(); 
} 

renderDinos(); 
updateStats(); 

function apostar() { 
    if (gameOver) { 
        showResult('🔒 O limite de prêmios foi atingido. Obrigado por jogar!', 'info'); 
        return; 
    } 
    const valor = parseFloat(document.getElementById('valor').value); 
    if (!valor || valor <= 0) { 
        showResult('Digite um valor válido para apostar!', 'info'); 
        return; 
    } 
    if (selectedDino === null) { 
        showResult('Escolha um dinossauro antes de apostar!', 'info'); 
        return; 
    } 

    lastBet = valor; 

    // Se for rodada grátis, não cobra o saldo do jogador
    if (!freeRound) {
        totalArrecadado += valor; 
    }
    
    updateStats(); 

    const sorteado = Math.floor(Math.random() * DINOS.length); 
    const premio = valor * 2; 
    document.getElementById('jackpot-area').innerHTML = ''; 
    
    const acertou = selectedDino === sorteado; 

    // Reseta o estado da rodada grátis após o uso
    if (freeRound) freeRound = false;

    if (acertou) { 
        // Verificação: limite global de prêmios atingido 
        if (totalPremios + premio > PRIZE_LIMIT) { 
            gameOver = true; 
            showResult(`🦕 O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Você acertou! Mas o limite de prêmios foi atingido. Ninguém mais pode ganhar hoje. 😈`, 'lose'); 
            updateStats(); 
            return; 
        } 

        // REMOVIDO: Regra oculta de rentabilidade dos 20% que fraudava o jogo
        
        totalPremios += premio; 
        updateStats(); 
        if (totalPremios >= PRIZE_LIMIT) gameOver = true; 
        showResult(`🎉 PARABÉNS! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}! Você ganhou ${fmt(premio)}!`, 'win'); 
        mostrarJackpot(); 
    } else { 
        const msg = `😢 Que pena! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Tente novamente!`; 
        showResult(msg, 'lose'); 
    } 
} 

function mostrarJackpot() { 
    const area = document.getElementById('jackpot-area'); 
    area.innerHTML = `<button class="btn-jackpot" onclick="tentarJackpot(this)">⚡ Chance única: 50x — ${fmt(lastBet * 50)}</button>`; 
} 

function tentarJackpot(btn) { 
    btn.parentElement.innerHTML = ''; 
    
    // Sorteio real: 1 chance em 11 (número total de dinossauros)
    const chanceJackpot = Math.floor(Math.random() * DINOS.length);
    const acertouJackpot = chanceJackpot === selectedDino; 
    const premioJackpot = lastBet * 50;

    if (acertouJackpot) {
        if (totalPremios + premioJackpot > PRIZE_LIMIT) {
            gameOver = true;
            showResult('🎉 Você acertou o Jackpot! Mas o prêmio estourou o limite máximo da máquina.', 'lose');
            return;
        }
        totalPremios += premioJackpot;
        updateStats();
        if (totalPremios >= PRIZE_LIMIT) gameOver = true;
        showResult(`🌋 INCRÍVEL! Você faturou o Jackpot de 50x e ganhou ${fmt(premioJackpot)}!`, 'win');
    } else {
        showResult('💀 O dino pulou fora! Você não ganhou o 50x desta vez. Mais sorte na próxima!', 'lose'); 
    }
} 

function showResult(msg, type) { 
    const area = document.getElementById('result-area'); 
    const cls = type === 'win' ? 'result-win' : type === 'lose' ? 'result-lose' : 'result-info'; 
    area.innerHTML = `<div class="result-box ${cls}">${msg}</div>`; 
} 

function showSecretModal() { 
    document.getElementById('modal-overlay').style.display = 'flex'; 
    document.getElementById('modal-title').textContent = '🔒 Área da Dona Bete'; 
    document.getElementById('modal-body').innerHTML = `<input type="password" id="modal-input" placeholder="Digite a senha" maxlength="10" /> <div class="modal-btns"> <button class="btn-secondary" onclick="closeModal()">Cancelar</button> <button class="btn-primary" onclick="checkSenha()">Confirmar</button> </div>`; 
    setTimeout(() => document.getElementById('modal-input')?.focus(), 100); 
} 

function checkSenha() { 
    const val = document.getElementById('modal-input')?.value || ''; 
    closeModal(); 
    setTimeout(() => { 
        if (val === '0171') { 
            const lucro = totalArrecadado - totalPremios; 
            document.getElementById('modal-overlay').style.display = 'flex'; 
            document.getElementById('modal-title').textContent = '💰 Relatório da Dona Bete'; 
            document.getElementById('modal-body').innerHTML = `<div class="modal-info"> Arrecadado: <b>${fmt(totalArrecadado)}</b><br> Prêmios pagos: <b>${fmt(totalPremios)}</b><br> <span style="color:#27500a;font-weight:500;">Lucro líquido: ${fmt(lucro)}</span> </div> <button class="btn-primary" onclick="closeModal()">Fechar</button>`; 
        } else { 
            freeRound = true; 
            document.getElementById('modal-overlay').style.display = 'flex'; 
            document.getElementById('modal-title').textContent = '🎁 Surpresa!'; 
            document.getElementById('modal-body').innerHTML = `<div class="modal-info"> Você ganhou uma rodada grátis! 🎉<br><small style="font-size:12px;color:#aaa">(Sua próxima aposta não custará nada)</small> </div> <button class="btn-primary" onclick="closeModal()">Eba!</button>`; 
        } 
    }, 150); 
} 
let historicoApostas = [];

function fmt(v) { return "R\$ " + v.toFixed(2).replace('.', ','); } 

function renderDinos() { 
    const grid = document.getElementById('dinos-grid'); 
    grid.innerHTML = ''; 
    DINOS.forEach((d, i) => { 
        const btn = document.createElement('button'); 
        btn.className = 'dino-btn' + (selectedDino === i ? ' selected' : ''); 
        btn.innerHTML = `${d.emoji}<span>${d.name}</span>`; 
        btn.onclick = () => { selectedDino = i; renderDinos(); }; 
        grid.appendChild(btn); 
    }); 
} 

function updateStats() { 
    document.getElementById('stat-arrecadado').textContent = fmt(totalArrecadado); 
    document.getElementById('stat-premios').textContent = fmt(totalPremios); 
    document.getElementById('stat-limite').textContent = fmt(Math.max(0, PRIZE_LIMIT - totalPremios)); 
    const pct = Math.min(100, (totalPremios / PRIZE_LIMIT) * 100); 
    document.getElementById('limit-bar').style.width = pct + '%'; 
    document.getElementById('limit-pct').textContent = pct.toFixed(0) + '%'; 
    if (pct >= 100) { document.getElementById('limit-bar').style.background = '#e24b4a'; } 
} 

// Função para adicionar uma jogada ao histórico e renderizar na tela
function adicionarAoHistorico(tipo, dinoEscolhido, dinoSorteado, valorAposta, valorGanho) {
    const novaJogada = {
        tipo: tipo, // 'Normal' ou 'Jackpot'
        dinoEscolhido: DINOS[dinoEscolhido],
        dinoSorteado: DINOS[dinoSorteado],
        valorAposta: valorAposta,
        valorGanho: valorGanho,
        ganhou: valorGanho > 0
    };

    // Adiciona no início do array
    historicoApostas.unshift(novaJogada);

    // Mantém apenas as últimas 5
    if (historicoApostas.length > 5) {
        historicoApostas.pop();
    }

    renderHistorico();
}

function renderHistorico() {
    const listaHtml = document.getElementById('historico-lista');
    if (!listaHtml) return;

    listaHtml.innerHTML = '';

    if (historicoApostas.length === 0) {
        listaHtml.innerHTML = '<div class="historico-vazio">Nenhuma aposta realizada ainda.</div>';
        return;
    }

    historicoApostas.forEach(j => {
        const item = document.createElement('div');
        item.className = `historico-item ${j.ganhou ? 'ganhou' : 'perdeu'}`;
        
        item.innerHTML = `
            <div class="historico-header">
                <span class="historico-tag">${j.tipo}</span>
                <span class="historico-resultado">${j.ganhou ? 'GANHOU' : 'PERDEU'}</span>
            </div>
            <div class="historico-detalhes">
                <span>Seu Dino: ${j.dinoEscolhido.emoji}</span>
                <span>Sorteado: ${j.dinoSorteado.emoji}</span>
            </div>
            <div class="historico-valores">
                <span>Aposta: ${fmt(j.valorAposta)}</span>
                <span class="valor-resultado">${j.ganhou ? '+' + fmt(j.valorGanho) : fmt(0)}</span>
            </div>
        `;
        listaHtml.appendChild(item);
    });
}

function escolherAleatorio() { 
    selectedDino = Math.floor(Math.random() * DINOS.length); 
    renderDinos(); 
} 

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    renderDinos(); 
    updateStats(); 
    renderHistorico();
});

function apostar() { 
    if (gameOver) { 
        showResult('🔒 O limite de prêmios foi atingido. Obrigado por jogar!', 'info'); 
        return; 
    } 
    const valor = parseFloat(document.getElementById('valor').value); 
    if (!valor || valor <= 0) { 
        showResult('Digite um valor válido para apostar!', 'info'); 
        return; 
    } 
    if (selectedDino === null) { 
        showResult('Escolha um dinossauro antes de apostar!', 'info'); 
        return; 
    } 

    lastBet = valor; 
    const eraFreeRound = freeRound;

    if (!freeRound) {
        totalArrecadado += valor; 
    }
    
    updateStats(); 

    const sorteado = Math.floor(Math.random() * DINOS.length); 
    const premio = valor * 2; 
    document.getElementById('jackpot-area').innerHTML = ''; 
    
    const acertou = selectedDino === sorteado; 

    if (freeRound) freeRound = false;

    if (acertou) { 
        if (totalPremios + premio > PRIZE_LIMIT) { 
            gameOver = true; 
            showResult(`🦕 O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Você acertou! Mas o limite de prêmios foi atingido. Ninguém mais pode ganhar hoje. 😈`, 'lose'); 
            adicionarAoHistorico(eraFreeRound ? 'Grátis' : 'Normal', selectedDino, sorteado, eraFreeRound ? 0 : valor, 0);
            updateStats(); 
            return; 
        } 
        
        totalPremios += premio; 
        updateStats(); 
        if (totalPremios >= PRIZE_LIMIT) gameOver = true; 
        showResult(`🎉 PARABÉNS! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}! Você ganhou ${fmt(premio)}!`, 'win'); 
        
      
        adicionarAoHistorico(eraFreeRound ? 'Grátis' : 'Normal', selectedDino, sorteado, eraFreeRound ? 0 : valor, premio);
        mostrarJackpot(); 
    } else { 
        showResult(`😢 Que pena! O dino sorteado foi ${DINOS[sorteado].emoji} ${DINOS[sorteado].name}. Tente novamente!`, 'lose'); 
        
        adicionarAoHistorico(eraFreeRound ? 'Grátis' : 'Normal', selectedDino, sorteado, eraFreeRound ? 0 : valor, 0);
    } 
} 

function mostrarJackpot() { 
    const area = document.getElementById('jackpot-area'); 
    area.innerHTML = `<button class="btn-jackpot" onclick="tentarJackpot(this)">⚡ Chance única: 50x — ${fmt(lastBet * 50)}</button>`; 
} 

function tentarJackpot(btn) { 
    btn.parentElement.innerHTML = ''; 
    
    const chanceJackpot = Math.floor(Math.random() * DINOS.length);
    const acertouJackpot = chanceJackpot === selectedDino; 
    const premioJackpot = lastBet * 50;

    if (acertouJackpot) {
        if (totalPremios + premioJackpot > PRIZE_LIMIT) {
            gameOver = true;
            showResult('🎉 Você acertou o Jackpot! Mas o prêmio estourou o limite máximo da máquina.', 'lose');
            adicionarAoHistorico('Jackpot', selectedDino, chanceJackpot, lastBet, 0);
            return;
        }
        totalPremios += premioJackpot;
        updateStats();
        if (totalPremios >= PRIZE_LIMIT) gameOver = true;
        showResult(`🌋 INCRÍVEL! Você faturou o Jackpot de 50x e ganhou ${fmt(premioJackpot)}!`, 'win');
        
        adicionarAoHistorico('Jackpot', selectedDino, chanceJackpot, lastBet, premioJackpot);
    } else {
        showResult('💀 O dino pulou fora! Você não ganhou o 50x desta vez. Mais sorte na próxima!', 'lose'); 
        
        adicionarAoHistorico('Jackpot', selectedDino, chanceJackpot, lastBet, 0);
    }
} 

function showResult(msg, type) { 
    const area = document.getElementById('result-area'); 
    const cls = type === 'win' ? 'result-win' : type === 'lose' ? 'result-lose' : 'result-info'; 
    area.innerHTML = `<div class="result-box ${cls}">${msg}</div>`; 
} 

function showSecretModal() { 
    document.getElementById('modal-overlay').style.display = 'flex'; 
    document.getElementById('modal-title').textContent = '🔒 Área da Dona Bete'; 
    document.getElementById('modal-body').innerHTML = `<input type="password" id="modal-input" placeholder="Digite a senha" maxlength="10" /> <div class="modal-btns"> <button class="btn-secondary" onclick="closeModal()">Cancelar</button> <button class="btn-primary" onclick="checkSenha()">Confirmar</button> </div>`; 
    setTimeout(() => document.getElementById('modal-input')?.focus(), 100); 
} 

function checkSenha() { 
    const val = document.getElementById('modal-input')?.value || ''; 
    closeModal(); 
    setTimeout(() => { 
        if (val === '0171') { 
            const lucro = totalArrecadado - totalPremios; 
            document.getElementById('modal-overlay').style.display = 'flex'; 
            document.getElementById('modal-title').textContent = '💰 Relatório da Dona Bete'; 
            document.getElementById('modal-body').innerHTML = `<div class="modal-info"> Arrecadado: <b>${fmt(totalArrecadado)}</b><br> Prêmios pagos: <b>${fmt(totalPremios)}</b><br> <span style="color:#27500a;font-weight:500;">Lucro líquido: ${fmt(lucro)}</span> </div> <button class="btn-primary" onclick="closeModal()">Fechar</button>`; 
        } else { 
            freeRound = true; 
            document.getElementById('modal-overlay').style.display = 'flex'; 
            document.getElementById('modal-title').textContent = '🎁 Surpresa!'; 
            document.getElementById('modal-body').innerHTML = `<div class="modal-info"> Você ganhou uma rodada grátis! 🎉<br><small style="font-size:12px;color:#aaa">(Sua próxima aposta não custará nada)</small> </div> <button class="btn-primary" onclick="closeModal()">Eba!</button>`; 
        } 
    }, 150); 
} 

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }


                    
                
        