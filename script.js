/* =========================================================
   CARTA PARA A MARIANA — script.js
   ---------------------------------------------------------
   Este ficheiro faz três coisas:
   1. Cria os corações que flutuam no fundo.
   2. Faz a transição da página inicial para a carta.
   3. Desenrola a carta (e volta a abri-la em "Ler outra vez").

   O texto da carta NÃO está aqui: está no index.html.
   ========================================================= */

(function () {
  'use strict';

  /* -------------------------------------------------------
     CONFIGURAÇÃO (✏️ podes mudar aqui)
     ------------------------------------------------------- */
  var CORES_CORACOES = ['#f9b4c8', '#f7a1bb', '#ffd0de', '#ee8fae', '#fbc6d6'];
  var CORACOES_COMPUTADOR = 18;   // quantos corações no computador
  var CORACOES_TELEMOVEL = 11;    // quantos corações no telemóvel
  var CORACOES_EXPLOSAO = 12;     // corações que saltam ao carregar no botão

  /* -------------------------------------------------------
     ELEMENTOS DA PÁGINA
     ------------------------------------------------------- */
  var fundoCoracoes = document.getElementById('coracoes');
  var inicio = document.getElementById('inicio');
  var cartaEcra = document.getElementById('carta-ecra');
  var papel = document.getElementById('papel');
  var conteudo = document.getElementById('papel-conteudo');
  var tituloCarta = document.getElementById('carta-titulo');
  var btnAbrir = document.getElementById('btn-abrir');
  var btnReler = document.getElementById('btn-reler');

  var reduzMovimento = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var ocupado = false; // evita cliques repetidos durante as animações


  /* -------------------------------------------------------
     FUNÇÕES AUXILIARES
     ------------------------------------------------------- */

  // Número aleatório entre min e max
  function aleatorio(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Pausa (em milissegundos)
  function pausa(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  // Espera que uma transição CSS termine (com um tempo limite de segurança,
  // para o site nunca ficar "preso" em nenhum navegador).
  function esperarTransicao(elemento, propriedade, limiteMs) {
    return new Promise(function (resolve) {
      var concluido = false;
      var temporizador;

      function concluir() {
        if (concluido) return;
        concluido = true;
        clearTimeout(temporizador);
        elemento.removeEventListener('transitionend', aoTerminar);
        resolve();
      }

      function aoTerminar(evento) {
        if (evento.target === elemento && evento.propertyName === propriedade) {
          concluir();
        }
      }

      elemento.addEventListener('transitionend', aoTerminar);
      temporizador = setTimeout(concluir, limiteMs);
    });
  }

  // Desenho de um coração (SVG) com a cor pedida, pronto a usar como imagem de fundo
  function imagemCoracao(cor) {
    var corCodificada = cor.replace('#', '%23');
    return "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='" +
      corCodificada +
      "' d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'/%3E%3C/svg%3E\")";
  }

  function corAleatoria() {
    return CORES_CORACOES[Math.floor(Math.random() * CORES_CORACOES.length)];
  }


  /* -------------------------------------------------------
     1. CORAÇÕES A FLUTUAR NO FUNDO
     ------------------------------------------------------- */
  function criarCoracoesDeFundo() {
    var total = window.innerWidth < 600 ? CORACOES_TELEMOVEL : CORACOES_COMPUTADOR;

    for (var i = 0; i < total; i++) {
      var coracao = document.createElement('span');
      var tamanho = aleatorio(12, 36);

      coracao.className = 'coracao';
      coracao.style.width = tamanho + 'px';
      coracao.style.height = tamanho + 'px';
      coracao.style.left = aleatorio(2, 96) + '%';
      coracao.style.backgroundImage = imagemCoracao(corAleatoria());
      coracao.style.setProperty('--opacidade', aleatorio(0.35, 0.7).toFixed(2));

      if (reduzMovimento) {
        // Sem movimento: corações parados em posições aleatórias
        coracao.classList.add('parado');
        coracao.style.top = aleatorio(4, 92) + '%';
      } else {
        coracao.style.setProperty('--deriva', aleatorio(-70, 70).toFixed(0) + 'px');
        coracao.style.setProperty('--rotacao', aleatorio(-35, 35).toFixed(0) + 'deg');
        coracao.style.animationDuration = aleatorio(13, 26).toFixed(1) + 's';
        // Atraso negativo: os corações já vão a meio do caminho quando a página abre
        coracao.style.animationDelay = '-' + aleatorio(0, 24).toFixed(1) + 's';
      }

      fundoCoracoes.appendChild(coracao);
    }
  }


  /* -------------------------------------------------------
     PEQUENA EXPLOSÃO DE CORAÇÕES (ao carregar no botão)
     ------------------------------------------------------- */
  function explosaoDeCoracoes(botao) {
    if (reduzMovimento) return;

    var caixa = botao.getBoundingClientRect();
    var centroX = caixa.left + caixa.width / 2;
    var centroY = caixa.top + caixa.height / 2;

    for (var i = 0; i < CORACOES_EXPLOSAO; i++) {
      var coracao = document.createElement('span');
      var angulo = (Math.PI * 2 * i) / CORACOES_EXPLOSAO + aleatorio(-0.3, 0.3);
      var distancia = aleatorio(70, 150);

      coracao.className = 'coracao-explosao';
      coracao.style.left = centroX + 'px';
      coracao.style.top = centroY + 'px';
      coracao.style.backgroundImage = imagemCoracao(corAleatoria());
      coracao.style.setProperty('--dx', (Math.cos(angulo) * distancia).toFixed(0) + 'px');
      coracao.style.setProperty('--dy', (Math.sin(angulo) * distancia - 30).toFixed(0) + 'px');
      coracao.style.setProperty('--rot', aleatorio(-50, 50).toFixed(0) + 'deg');

      coracao.addEventListener('animationend', function (evento) {
        evento.target.remove();
      });

      document.body.appendChild(coracao);
    }
  }


  /* -------------------------------------------------------
     3. DESENROLAR E ENROLAR A CARTA
     A folha cresce de altura 0 até à altura real do texto.
     ------------------------------------------------------- */
  async function desenrolarCarta() {
    // Altura real do texto (mesmo com a folha fechada)
    var alturaFinal = conteudo.offsetHeight;

    papel.style.height = alturaFinal + 'px';
    papel.classList.add('aberto');

    await esperarTransicao(papel, 'height', 6000);

    // Depois de aberta, a altura volta a ser automática
    // (assim a carta adapta-se se rodares o telemóvel ou mudares o tamanho da janela)
    papel.style.height = 'auto';
  }

  async function enrolarCarta() {
    // Fixa a altura atual (não se consegue animar a partir de "auto")
    papel.style.height = papel.offsetHeight + 'px';
    void papel.offsetHeight; // obriga o navegador a registar a altura

    papel.classList.remove('aberto');
    papel.style.height = '0px';

    await esperarTransicao(papel, 'height', 6000);
  }


  /* -------------------------------------------------------
     2. DA PÁGINA INICIAL PARA A CARTA
     ------------------------------------------------------- */
  async function abrirCarta() {
    if (ocupado) return;
    ocupado = true;

    explosaoDeCoracoes(btnAbrir);

    // A página inicial desaparece suavemente
    inicio.classList.add('a-sair');
    await esperarTransicao(inicio, 'opacity', 1800);
    inicio.hidden = true;

    // Aparece o ecrã da carta (com o papel ainda enrolado)
    cartaEcra.hidden = false;
    window.scrollTo(0, 0);
    void cartaEcra.offsetHeight; // obriga o navegador a registar a mudança
    cartaEcra.classList.add('visivel');

    await pausa(reduzMovimento ? 0 : 700);

    // A carta desenrola-se
    await desenrolarCarta();

    // Coloca o foco no título (ajuda quem usa leitores de ecrã ou teclado)
    tituloCarta.focus({ preventScroll: true });
    btnReler.classList.add('mostrar');

    ocupado = false;
  }

  async function lerOutraVez() {
    if (ocupado) return;
    ocupado = true;

    btnReler.classList.remove('mostrar');

    // Sobe ao topo e enrola a carta
    window.scrollTo({ top: 0, behavior: reduzMovimento ? 'auto' : 'smooth' });
    await enrolarCarta();
    await pausa(reduzMovimento ? 0 : 800);

    // Volta a desenrolar
    await desenrolarCarta();

    btnReler.classList.add('mostrar');
    ocupado = false;
  }


  /* -------------------------------------------------------
     ARRANQUE
     ------------------------------------------------------- */
  criarCoracoesDeFundo();
  btnAbrir.addEventListener('click', abrirCarta);
  btnReler.addEventListener('click', lerOutraVez);

})();
