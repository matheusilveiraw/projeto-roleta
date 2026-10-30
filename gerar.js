// lê o palavras.txt e gera o palavras.js, que o navegador consegue carregar
// mesmo abrindo o index.html direto (sem servidor)
const fs = require('fs');
const path = require('path');

const texto = fs.readFileSync(path.join(__dirname, 'palavras.txt'), 'utf8');
const palavras = texto
  .split(/\r?\n/)
  .map(p => p.trim())
  .filter(p => p !== '');

fs.writeFileSync(
  path.join(__dirname, 'palavras.js'),
  `// gerado automaticamente a partir do palavras.txt - não edite aqui\nconst PALAVRAS = ${JSON.stringify(palavras)};\n`
);

console.log(`${palavras.length} palavras carregadas do palavras.txt`);
