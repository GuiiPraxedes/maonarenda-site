/* Funil da página de produto (eventos próprios da Meta, só para leitura: nunca escolher como meta de otimização).
   Carregado depois de js/pixel.js. A página se marca no HTML, sem mexer aqui:
     <body data-funil-produto="Kit de Prompts">        nome do produto (vai como content_name)
     data-funil="entrega|prova|prompts|oferta|garantia|faq"   seções (PgViuEntrega, PgViuProva, ...)
     data-funil-cta="topo|oferta|barra|..."            no link de compra ou num elemento que o contenha (PgCliqueTopo, ...)
   Cada evento dispara no máximo uma vez por carregamento da página, e só para quem veio de anúncio
   (utm_source=meta ou utm_medium=pago, na URL ou no "mnr_rastreio" da sessão) ou com funil=1 na URL (teste).
   Nada de dado pessoal, texto digitado ou URL nos eventos: só o nome do produto e, no FAQ, o texto da pergunta.
   Sem IntersectionObserver, as seções simplesmente não são medidas.
   ATENÇÃO: os nomes Pg* NÃO levam o produto e a API de estatísticas só agrega por nome. Este funil vale só para o Kit de
   Prompts; outro produto exigiria prefixo próprio (ex.: PgOutroChegou) para não misturar os totais.
   Ler o funil a partir do PgChegou (o ViewContent conta todas as visitas, inclusive as que não vieram de anúncio).
   Visita de teste com funil=1 ou pelo link do anúncio entra na conta: anotar data e hora e descontar. */
(function () {
  var corpo = document.body || document.documentElement;
  if (typeof fbq !== 'function') return;

  function ler(chave) { try { return sessionStorage.getItem(chave); } catch (e) { return null; } }
  var busca = location.search.replace(/^\?/, ''), sessao = ler('mnr_rastreio') || '';
  var veioDeAnuncio = /(^|&)(utm_source=meta|utm_medium=pago)(&|$)/.test(busca + '&' + sessao);
  if (!veioDeAnuncio && !/(^|&)funil=1(&|$)/.test(busca)) return;

  var feito = {}, produto = null;
  function disparar(nome, extra) {
    if (feito[nome]) return;
    feito[nome] = true;
    var dados = { content_name: produto || '' }, k;
    if (extra) for (k in extra) dados[k] = extra[k];
    fbq('trackCustom', nome, dados);
  }
  function maiuscula(t) { return t.charAt(0).toUpperCase() + t.slice(1); }

  function iniciar() {
    produto = document.body.getAttribute('data-funil-produto');
    if (!produto) return;
    disparar('PgChegou');

    // seções vistas: pelo menos 40% dela (ou 300 px, o que for menor) visível por 1 segundo seguido
    var nomes = { entrega: 'PgViuEntrega', prova: 'PgViuProva', prompts: 'PgViuPrompts', oferta: 'PgViuOferta', garantia: 'PgViuGarantia', faq: 'PgViuFAQ' };
    var secoes = document.querySelectorAll('[data-funil]');
    if (window.IntersectionObserver) {
      for (var i = 0; i < secoes.length; i++) (function (el) {
        var nome = nomes[el.getAttribute('data-funil')], espera;
        var alt = el.getBoundingClientRect().height;
        if (!nome || !alt) return;
        var minimo = Math.min(0.4, 300 / alt);
        var obs = new IntersectionObserver(function (lista) {
          var e = lista[lista.length - 1];
          clearTimeout(espera);
          if (e.intersectionRatio >= minimo - 0.001) {
            espera = setTimeout(function () { disparar(nome); obs.disconnect(); }, 1000);
          }
        }, { threshold: [minimo] });
        obs.observe(el);
      })(secoes[i]);
    }

    // tempo na página com a aba visível (um segundo por vez; não conta com a aba oculta)
    var marcas = { 10: 'PgFicou10s', 30: 'PgFicou30s', 60: 'PgFicou60s' }, segundos = 0;
    var relogio = setInterval(function () {
      if (document.hidden) return;
      segundos++;
      if (marcas[segundos]) disparar(marcas[segundos]);
      if (segundos >= 60) clearInterval(relogio);
    }, 1000);

    // primeira pergunta do FAQ aberta (o evento toggle não borbulha: captura no document)
    document.addEventListener('toggle', function (ev) {
      var d = ev.target;
      if (!d || d.tagName !== 'DETAILS' || !d.open || !d.closest || !d.closest('[data-funil="faq"]')) return;
      var s = d.querySelector('summary');
      disparar('PgAbriuFAQ', { pergunta: (s ? s.textContent : '').replace(/\s+/g, ' ').trim().slice(0, 80) });
    }, true);

    // clique num link de compra, pelo data-funil-cta mais próximo (o CliqueCheckout continua em js/pixel.js)
    document.addEventListener('click', function (ev) {
      var alvo = ev.target;
      if (!alvo.closest || !alvo.closest('a[href^="https://pay.kiwify.com.br/"]')) return;
      var c = alvo.closest('[data-funil-cta]');
      if (c) disparar('PgClique' + maiuscula(c.getAttribute('data-funil-cta').replace(/[^a-z0-9]/gi, '')));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
