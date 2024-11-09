window.onload = function() {
    document.getElementById('btnReiniciar').addEventListener('click', reiniciar);
    document.getElementById('btnVerificar').addEventListener('click', verificar);
    document.getElementById('btnDesistir').addEventListener('click', revela);
    document.getElementById('btnPistas').addEventListener('click', pistas);
    carregarPalavras(); // Carregar as palavras usando AJAX
}

const cacaPalavras = document.getElementById('cacaPalavras');
const linhas = 10;
const colunas = 10;
const letras = 'ABCDEFGHIJLMNOPRSTUVWXYSAEIO';
let clicadas = [];
let palavras = []; // Inicialmente vazia, será carregada via AJAX
let dicas = []; // Inicialmente vazia, será carregada via AJAX

// Função para carregar palavras via AJAX
function carregarPalavras() {
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText);
            palavras = data.palavras;
            dicas = data.dicas; // Carregar dicas
            criarGrade();
        }
    }
    xmlhttp.open("GET", "palavras.json", true);
    xmlhttp.send();
}


// Função para criar a grade de células
function criarGrade() {
    cacaPalavras.innerHTML = ''; // Limpar conteúdo existente
    for (let i = 0; i < linhas; i++) {
        let linha = document.createElement('div');
        linha.classList.add('linha');
        for (let j = 0; j < colunas; j++) {
            let celula = document.createElement('span');
            celula.classList.add('celula');
            celula.textContent = letras[Math.floor(Math.random() * letras.length)];
            linha.appendChild(celula);

            // Adicionar event listener para alternar a cor ao clicar e registrar a célula
            celula.addEventListener('click', () => {
                if (celula.style.backgroundColor === 'rgb(191, 174, 252)') {
                    celula.style.backgroundColor = '';
                    removeCelulaClicada(i, j);
                } else {
                    celula.style.backgroundColor = '#bfaefc';
                    clicadas.push({ linha: i, coluna: j });
                }
            });
        }
        cacaPalavras.appendChild(linha);
    }
    adicionarPalavras(); // Adicionar as palavras à grade
}

// Função para remover células clicadas do array
function removeCelulaClicada(linha, coluna) {
    for (let i = 0; i < clicadas.length; i++) {
        if (clicadas[i].linha === linha && clicadas[i].coluna === coluna) {
            clicadas.splice(i, 1);
            break;
        }
    }
}

// Função para adicionar palavras à grade
function adicionarPalavras() {
    palavras.forEach(item => {
        let { palavra, linha, coluna, horizontal, diagonal } = item;
        for (let i = 0; i < palavra.length; i++) {
            let celula;
            if (horizontal) {
                celula = cacaPalavras.children[linha].children[coluna + i];
            } else if (diagonal) {
                celula = cacaPalavras.children[linha + i].children[coluna + i];
            } else {
                celula = cacaPalavras.children[linha + i].children[coluna];
            }
            if (celula) {
                celula.textContent = palavra[i];
                celula.dataset.certa = 'true'; // Marcar célula correta
                celula.dataset.palavra = palavra; // Armazenar a palavra à qual a célula pertence
            }
        }
    });
}


// Função para reiniciar o jogo
function reiniciar() {
    clicadas = []; // Limpar células clicadas
    criarGrade(); // Recriar a grade
    removerPistas(); 
    document.getElementById('btnPistas').disabled = false;
    document.getElementById('btnVerificar').disabled = false;
    document.getElementById('btnDesistir').disabled = false;
}

let dicaIndex = 0;

//Mostra pistas
function pistas() {
    const pistasDiv = document.getElementById('pistas');

    // Adicionar o título apenas uma vez
    if (dicaIndex === 0) {
        const titulo = document.createElement('h3');
        titulo.textContent = "Veja essas dicas:";
        pistasDiv.appendChild(titulo);
    }

    // Mostrar a próxima dica
    if (dicaIndex < dicas.length) {
        const dicaElemento = document.createElement('div');
        dicaElemento.textContent = dicas[dicaIndex];
        pistasDiv.appendChild(dicaElemento);
        dicaIndex++;
    }

    //Desabilita botão quando acabam as pistas 
    if (dicaIndex === dicas.length) {
        document.getElementById('btnPistas').disabled = true;
    }
}


// Função para verificar as palavras selecionadas

function verificar() {
    let todasCertas = true;

    // Verificar cada palavra
    palavras.forEach(item => {
        let { palavra, linha, coluna, horizontal, diagonal } = item;
        let palavraCompleta = true;

        for (let i = 0; i < palavra.length; i++) {
            let celula;
            if (horizontal) {
                celula = cacaPalavras.children[linha].children[coluna + i];
            } else if (diagonal) {
                celula = cacaPalavras.children[linha + i].children[coluna + i];
            } else {
                celula = cacaPalavras.children[linha + i].children[coluna];
            }

            // Verificar se a célula está marcada corretamente
            if (!celula || celula.style.backgroundColor !== 'rgb(191, 174, 252)') {
                palavraCompleta = false;
                todasCertas = false;
                break;
            }
        }

        if (!palavraCompleta) {
            todasCertas = false;
        }
    });

    // Se todas as palavras estiverem corretas, marcar tudo como verde
    if (todasCertas) {
        palavras.forEach(item => {
            let { palavra, linha, coluna, horizontal, diagonal } = item;
            for (let i = 0; i < palavra.length; i++) {
                let celula;
                if (horizontal) {
                    celula = cacaPalavras.children[linha].children[coluna + i];
                } else if (diagonal) {
                    celula = cacaPalavras.children[linha + i].children[coluna + i];
                } else {
                    celula = cacaPalavras.children[linha + i].children[coluna];
                }
                if (celula) {
                    celula.style.backgroundColor = '#a4ffba';
                }
            }
        });
        removerPistas(); 
        const acertou = document.getElementById('pistas');
        acertou.innerHTML = '<h3>Parabéns! Você encontrou todas as palavras.</h3>';
        document.getElementById('btnPistas').disabled = true;
        document.getElementById('btnDesistir').disabled = true;
        document.getElementById('btnVerificar').disabled = true;
    } else {
        // Caso contrário, deixar todo tabuleiro branco
        for (let i = 0; i < linhas; i++) {
            for (let j = 0; j < colunas; j++) {
                let celula = cacaPalavras.children[i].children[j];
                celula.style.backgroundColor = '';
            }
        }
        alert('Você precisa encontrar todas as palavras. Tente novamente!');
    }
}

//mostra o resultado
function revela() {
    palavras.forEach(item => {
        let { palavra, linha, coluna, horizontal, diagonal } = item;
        for (let i = 0; i < palavra.length; i++) {
            let celula;
            if (horizontal) {
                celula = cacaPalavras.children[linha].children[coluna + i];
            } else if (diagonal) {
                celula = cacaPalavras.children[linha + i].children[coluna + i];
            } else {
                celula = cacaPalavras.children[linha + i].children[coluna];
            }
            if (celula) {
                celula.style.backgroundColor = '#a4ffba';
            }
        }
    });
    document.getElementById('btnPistas').disabled = true;
    document.getElementById('btnVerificar').disabled = true;
    removerPistas(); 
}

function removerPistas() {
    const pistasDiv = document.getElementById('pistas');
    pistasDiv.innerHTML = ''; // Limpar o conteúdo das pistas
    dicaIndex = 0; // Reiniciar o índice das dicas
}
