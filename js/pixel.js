/* Pixel da Meta (conjunto de dados "Mão na Renda - Site e Kiwify").
   PageView em todas as páginas (menos /obrigado/*, ver abaixo), ViewContent nas páginas de produto e Lead ao baixar o
   guia grátis (uma vez por sessão).
   Eventos próprios, só para leitura (nunca escolher como meta de otimização), cada um no máximo uma vez por página:
   CliqueCheckout (clique num link da Kiwify) e ProvouPrompt ("Copiar prompt" ou "Testar no ChatGPT" na /ia/kit/).
   InitiateCheckout e Purchase são disparados pela própria Kiwify (Pixel configurado em cada produto).
   Os parâmetros utm_* e fbclid seguem para o checkout, para a Kiwify atribuir a venda ao anúncio. Eles ficam guardados
   na sessão (sessionStorage, só eles) e valem também nas páginas abertas depois, sem parâmetros na URL. */
(function () {
  var caminho = location.pathname.replace(/^\/maonarenda-site/, '');

  // /obrigado/*: a Kiwify chega aqui com parâmetros da compra na URL (o token do upsell, talvez mais) e o pixel mandaria
  // a URL inteira ao Meta. A Compra já vai pela Kiwify; nestas páginas o pixel nem carrega.
  if (caminho.indexOf('/obrigado/') === 0) return;

  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '1771734920743764');
  fbq('track', 'PageView');

  // Kit: 19 até 06/10, 27 a partir de 07/10 00:00. O valor e a data vêm de js/preco.js, carregado antes deste
  // arquivo na /ia/kit/; se ele não carregar, a página continua mostrando R$ 19, e o value acompanha.
  var produtos = {
    '/doces/': { content_name: 'Doces para Vender', content_category: 'receitas', value: 37, currency: 'BRL' },
    '/bolo-de-pote/': { content_name: 'Bolo de pote para vender', content_category: 'receitas', value: 19.9, currency: 'BRL' },
    '/ia/kit/': { content_name: 'Kit de Prompts', content_category: 'renda extra com IA', value: window.MNR_PRECO_KIT || 19, currency: 'BRL' },
    '/ia/': { content_name: 'Do Celular ao Balcão', content_category: 'renda extra com IA', value: 47, currency: 'BRL' }
  };
  var produto = produtos[caminho];
  if (produto) fbq('track', 'ViewContent', produto);

  // sessionStorage pode faltar ou dar erro (aba anônima, bloqueio de dados): aí vale só a página atual.
  function ler(chave) { try { return sessionStorage.getItem(chave); } catch (e) { return null; } }
  function gravar(chave, valor) { try { sessionStorage.setItem(chave, valor); } catch (e) {} }
  function chaveDe(par) { return par.split('=')[0]; }
  function rastreio(par) { return /^(utm_\w+|fbclid)$/.test(chaveDe(par)); }
  function pares(busca) {
    var lista = busca.replace(/^\?/, '').split('&'), saida = [];
    for (var i = 0; i < lista.length; i++) if (lista[i]) saida.push(lista[i]);
    return saida;
  }

  // Parâmetros para o checkout: os da URL atual, como sempre. Se ela não tiver utm_* nem fbclid, entram também os
  // guardados na sessão; se tiver, eles substituem os guardados (vale o último anúncio clicado).
  var atuais = pares(location.search), guardar = [];
  for (var i = 0; i < atuais.length; i++) if (rastreio(atuais[i])) guardar.push(atuais[i]);
  var repassar = atuais.slice();
  if (guardar.length) gravar('mnr_rastreio', guardar.join('&'));
  else repassar = repassar.concat(pares(ler('mnr_rastreio') || ''));

  function anexar() {
    if (!repassar.length) return;
    var links = document.querySelectorAll('a[href^="https://pay.kiwify.com.br/"]');
    for (var i = 0; i < links.length; i++) {
      var partes = links[i].href.split('#'), url = partes[0], ancora = partes.length > 1 ? '#' + partes.slice(1).join('#') : '';
      var tem = {}, ja = url.indexOf('?') < 0 ? [] : pares(url.slice(url.indexOf('?') + 1));
      for (var j = 0; j < ja.length; j++) tem[chaveDe(ja[j])] = true;
      for (var k = 0; k < repassar.length; k++) {
        if (tem[chaveDe(repassar[k])]) continue; // nunca repetir um parâmetro que o link já tem
        tem[chaveDe(repassar[k])] = true;
        url += (url.indexOf('?') < 0 ? '?' : '&') + repassar[k];
      }
      links[i].href = url + ancora;
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', anexar);
  else anexar();

  var feito = {};
  document.addEventListener('click', function (ev) {
    var alvo = ev.target, a;
    if (!alvo.closest) return;

    // baixar o guia grátis conta como Lead, uma vez por sessão (sem sessionStorage, uma vez por página)
    if (alvo.closest('a[href$=".pdf"]') && !feito.lead && !ler('mnr_lead')) {
      feito.lead = true; gravar('mnr_lead', '1');
      fbq('track', 'Lead', { content_name: 'Guia 7 ideias de renda extra' });
    }

    // clique para o checkout (medida aproximada: o navegador pode cortar o envio ao sair da página).
    // O checkout do Kit (zuuMcMh) conta como Kit em qualquer página; os outros levam o produto da página atual, se houver.
    a = alvo.closest('a[href^="https://pay.kiwify.com.br/"]');
    if (a && !feito.checkout) {
      feito.checkout = true;
      var dados = /^https:\/\/pay\.kiwify\.com\.br\/zuuMcMh([?#]|$)/.test(a.href) ? produtos['/ia/kit/'] : produto;
      if (dados) fbq('trackCustom', 'CliqueCheckout', { content_name: dados.content_name, value: dados.value, currency: 'BRL' });
      else fbq('trackCustom', 'CliqueCheckout');
    }

    // amostra da /ia/kit/: copiar o prompt ou abrir no ChatGPT
    a = alvo.closest('[data-copiar], [data-chatgpt]');
    if (a && !feito.prova) {
      feito.prova = true;
      fbq('trackCustom', 'ProvouPrompt', { acao: a.hasAttribute('data-copiar') ? 'copiar' : 'chatgpt' });
    }
  });
})();
