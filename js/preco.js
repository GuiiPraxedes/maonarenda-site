/* Preço do Kit de Prompts: R$ 19, sem data de troca.
   A virada para R$ 27 em 07/10 foi CANCELADA em 06/10/2026 (decisão do Guilherme, antes do prazo anunciado): a faixa
   de preço promocional e a contagem regressiva saíram das páginas, e nenhuma promoção foi prorrogada.
   Carregar no <head>, ANTES do pixel.js: ele lê window.MNR_PRECO_KIT para o value do ViewContent.
   Para uma mudança de preço futura: preencher VIRADA (ex.: '2026-11-01T00:00:00-03:00') e PRECO_DEPOIS; cada preço do
   Kit no HTML já está marcado com [data-kit="antes|depois"] (vazio = o trecho some) e troca sozinho na data.
   Meta description e og:description não mudam por JS: editar à mão. Nunca reativar faixa de "promoção" com prazo
   sem a subida decidida (CDC art. 37). */
(function () {
  var VIRADA = null;          // sem troca de preço programada
  var PRECO_ANTES = 19, PRECO_DEPOIS = 27;
  var virada = VIRADA ? new Date(VIRADA).getTime() : null;
  window.MNR_VIRADA = virada;
  window.MNR_PRECO_KIT = virada !== null && Date.now() >= virada ? PRECO_DEPOIS : PRECO_ANTES;
  if (virada === null) return;

  function virar() {
    var els = document.querySelectorAll('[data-kit]');
    for (var i = 0; i < els.length; i++) els[i].textContent = els[i].getAttribute('data-kit').split('|')[1] || '';
  }

  function iniciar() {
    var r = virada - Date.now();
    if (r <= 0) { virar(); return; }
    // com a página aberta na virada, a troca acontece na hora (só até 1 dia de antecedência)
    if (r < 86400000) setTimeout(virar, r);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
