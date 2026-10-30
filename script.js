const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const botao = document.getElementById('girar');
const resultado = document.getElementById('resultado');
const total = document.getElementById('total');
const botaoClassificar = document.getElementById('classificar');
const classificacao = document.getElementById('classificacao');

const cores = ['#ff6b6b', '#feca57', '#48dbfb', '#1dd1a1', '#5f27cd', '#ff9ff3', '#54a0ff', '#ff9f43'];

const FATIAS = 12; // quantas palavras aparecem desenhadas na roleta

const todas = PALAVRAS; // todas as palavras do palavras.txt (vem do palavras.js)
let palavras = [];      // as que estão desenhadas na roleta agora
let angulo = 0;         // rotação atual em radianos
let girando = false;
let sorteada = null;    // última palavra sorteada

function aleatorio(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// monta a roleta com a vencedora + outras palavras aleatórias, sem repetir
function montarRoleta(vencedora) {
  const escolhidas = new Set(vencedora ? [vencedora] : []);
  const quantidade = Math.min(FATIAS, todas.length);
  while (escolhidas.size < quantidade) {
    escolhidas.add(aleatorio(todas));
  }
  palavras = [...escolhidas].sort(() => Math.random() - 0.5);
}

function desenhar() {
  const tamanho = canvas.width;
  const centro = tamanho / 2;
  const fatia = (2 * Math.PI) / palavras.length;

  ctx.clearRect(0, 0, tamanho, tamanho);

  palavras.forEach((palavra, i) => {
    const inicio = angulo + i * fatia;

    // fatia
    ctx.beginPath();
    ctx.moveTo(centro, centro);
    ctx.arc(centro, centro, centro, inicio, inicio + fatia);
    ctx.fillStyle = cores[i % cores.length];
    // evita duas fatias vizinhas da mesma cor quando a última encosta na primeira
    if (i === palavras.length - 1 && i % cores.length === 0 && i > 0) {
      ctx.fillStyle = cores[1];
    }
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // texto
    ctx.save();
    ctx.translate(centro, centro);
    ctx.rotate(inicio + fatia / 2);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${Math.max(12, Math.min(24, 300 / palavras.length))}px system-ui, sans-serif`;
    ctx.fillText(palavra, centro - 20, 0, centro - 50);
    ctx.restore();
  });

  // círculo central
  ctx.beginPath();
  ctx.arc(centro, centro, 25, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
}

function girar() {
  if (girando) return;
  girando = true;
  botao.disabled = true;
  resultado.textContent = '';
  classificacao.textContent = '';
  botaoClassificar.hidden = true;

  // sorteia entre TODAS as palavras do arquivo
  const vencedora = aleatorio(todas);
  montarRoleta(vencedora);

  // calcula o ângulo final para a fatia da vencedora parar embaixo do ponteiro (topo = -90°)
  const fatia = (2 * Math.PI) / palavras.length;
  const indice = palavras.indexOf(vencedora);
  const posicaoNaFatia = (0.15 + Math.random() * 0.7) * fatia; // não para exatamente na borda
  const alvo = -Math.PI / 2 - indice * fatia - posicaoNaFatia;
  const volta = 2 * Math.PI;
  const falta = (((alvo - angulo) % volta) + volta) % volta;
  const voltas = 5 + Math.floor(Math.random() * 3); // 5 a 7 voltas inteiras

  const inicio = angulo;
  const fim = inicio + voltas * volta + falta;
  const duracao = 5000;
  const comeco = performance.now();

  function animar(agora) {
    const t = Math.min((agora - comeco) / duracao, 1);
    const desacelera = 1 - Math.pow(1 - t, 4); // easing: começa rápido, termina devagar
    angulo = inicio + (fim - inicio) * desacelera;
    desenhar();

    if (t < 1) {
      requestAnimationFrame(animar);
    } else {
      girando = false;
      botao.disabled = false;
      resultado.textContent = `🎉 ${vencedora}`;
      sorteada = vencedora;
      botaoClassificar.hidden = false;
    }
  }

  requestAnimationFrame(animar);
}

botao.addEventListener('click', girar);

botaoClassificar.addEventListener('click', () => {
  classificacao.textContent = classificar(sorteada);
});

if (todas.length === 0) {
  resultado.textContent = 'O palavras.txt está vazio.';
  botao.disabled = true;
} else {
  total.textContent = `Sorteando entre ${todas.length} palavras`;
  botao.disabled = false;
  montarRoleta();
  desenhar();
}
