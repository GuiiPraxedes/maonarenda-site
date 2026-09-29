/* Virada do preço do Kit de Prompts: R$ 19 (promocional) até 06/10 às 23h59; R$ 27 a partir de 07/10 00:00 (Brasília).
   A data fica SÓ aqui. Carregar no <head>, ANTES do pixel.js: ele lê window.MNR_PRECO_KIT para o value do ViewContent.
   - [data-kit="antes|depois"]: na virada, o texto do elemento vira o "depois" (vazio = o trecho some).
     O HTML já traz o "antes"; marcar só preço do Kit (nunca o bolo de 19,90).
   - [data-lancamento]: faixa do preço promocional com contagem regressiva ([data-relogio]); some na virada.
   O relógio é o do aparelho do visitante. Meta description e og:description não mudam por JS: editar à mão em 07/10. */
(function () {
  var virada = new Date('2026-10-07T00:00:00-03:00').getTime();
  window.MNR_VIRADA = virada;
  window.MNR_PRECO_KIT = Date.now() >= virada ? 27 : 19;

  function dois(n) { return (n < 10 ? '0' : '') + n; }

  function virar(faixas) {
    var els = document.querySelectorAll('[data-kit]');
    for (var i = 0; i < els.length; i++) els[i].textContent = els[i].getAttribute('data-kit').split('|')[1] || '';
    for (var j = 0; j < faixas.length; j++) faixas[j].hidden = true;
  }

  function iniciar() {
    var faixas = document.querySelectorAll('[data-lancamento]');
    function tique() {
      var r = virada - Date.now();
      if (r <= 0) { virar(faixas); return false; }
      var s = Math.floor(r / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600),
          m = Math.floor(s % 3600 / 60), x = s % 60;
      var txt = (d ? d + (d > 1 ? ' dias ' : ' dia ') : '') + dois(h) + ':' + dois(m) + ':' + dois(x);
      for (var i = 0; i < faixas.length; i++) {
        faixas[i].hidden = false;
        faixas[i].querySelector('[data-relogio]').textContent = 'faltam ' + txt;
      }
      return true;
    }
    // com a página aberta na virada, a troca acontece na hora
    if (tique()) { var t = setInterval(function () { if (!tique()) clearInterval(t); }, 1000); }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
