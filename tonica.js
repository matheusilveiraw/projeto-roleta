// classifica uma palavra pela sílaba tônica, usando as regras de acentuação do português:
// - se tem acento (á é í ó ú â ê ô ã õ), o acento mostra onde está a tônica
// - se não tem, termina em a/e/o(s), em, ens, am -> paroxítona; o resto -> oxítona

const AGUDO_CIRCUNFLEXO = /[áéíóúâêô]/;
const TIL = /[ãõ]/;
const VOGAL = /[aeiouáéíóúâêôãõü]/;

// conta as sílabas de um trecho pelos grupos de vogais
// (vogais juntas contam como uma só sílaba, como em "ua" de água, "ão" de órgão)
function contarGrupos(trecho) {
  const grupos = trecho.match(/[aeiouáéíóúâêôãõü]+/g);
  return grupos ? grupos.length : 0;
}

// conta as sílabas de uma palavra sem acento, separando hiatos (di-a, lu-a, bo-a, ra-iz);
// i/u depois de outra vogal formam ditongo (rei, mau), e u depois de q/g não conta (qual, aqui)
function contarSilabas(palavra) {
  let silabas = 0;
  let vogalAntes = false; // a letra anterior era uma vogal que conta
  for (let i = 0; i < palavra.length; i++) {
    const letra = palavra[i];
    if (!VOGAL.test(letra)) {
      vogalAntes = false;
      continue;
    }
    const anterior = palavra[i - 1];
    if (/[uü]/.test(letra) && /[qg]/.test(anterior || '') && VOGAL.test(palavra[i + 1] || '')) {
      vogalAntes = false; // o u de "qu"/"gu" funciona como consoante
      continue;
    }
    // i/u colado em vogal é ditongo, a não ser no fim antes de r/l/z/m/n (ra-iz, sa-ir, ru-im)
    const hiato = /^[rlzmn]s?$/.test(palavra.slice(i + 1));
    if (/[iu]/.test(letra) && vogalAntes && !hiato) continue;
    silabas++;
    vogalAntes = true;
  }
  return silabas;
}

function classificar(original) {
  const palavra = original.toLowerCase().replace(/[^a-záéíóúâêôãõçàü]/g, '');

  // acha a vogal tônica marcada: agudo/circunflexo vale mais que til (órgão, bênção)
  let posicao = palavra.search(AGUDO_CIRCUNFLEXO);
  if (posicao === -1) posicao = palavra.search(TIL);

  if (posicao === -1) {
    // sem acento
    if (contarSilabas(palavra) <= 1) return 'Monossílaba';
    return /(a|e|o|as|es|os|em|ens|am)$/.test(palavra) ? 'Paroxítona' : 'Oxítona';
  }

  // com acento: conta quantas sílabas vêm depois da tônica
  const tonica = palavra[posicao];
  let resto = palavra.slice(posicao + 1);

  // vogais coladas na tônica fazem parte da mesma sílaba (papéis, chapéu, mãe, botões),
  // menos depois de í/ú, que formam hiato (ba-í-a, sa-ú-de)
  if (!/[íú]/.test(tonica)) {
    const colada = /[ãõ]/.test(tonica) ? /^[eiou]+/ : /^[iu]+/;
    resto = resto.replace(colada, '');
  }

  const depois = contarGrupos(resto);
  const antes = contarSilabas(palavra.slice(0, posicao));

  if (antes === 0 && depois === 0) return 'Monossílaba';
  if (depois === 0) return 'Oxítona';
  if (depois === 1) return 'Paroxítona';
  return 'Proparoxítona';
}
