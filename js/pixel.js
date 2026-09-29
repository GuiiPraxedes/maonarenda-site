/* Pixel da Meta (conjunto de dados "Mão na Renda - Site e Kiwify").
   PageView em todas as páginas, ViewContent nas páginas de produto e Lead ao baixar o guia grátis.
   InitiateCheckout e Purchase são disparados pela própria Kiwify (Pixel configurado em cada produto).
   Os parâmetros da URL (utm_*, fbclid) seguem para o checkout, para a Kiwify atribuir a venda ao anúncio. */
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
document,'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1771734920743764');
fbq('track', 'PageView');

(function () {
  // Kit: 19 até 06/10, 27 a partir de 07/10 00:00. O valor e a data vêm de js/preco.js, carregado antes deste
  // arquivo na /ia/kit/; se ele não carregar, a página continua mostrando R$ 19, e o value acompanha.
  var produtos = {
    '/doces/': { content_name: 'Doces para Vender', content_category: 'receitas', value: 37, currency: 'BRL' },
    '/bolo-de-pote/': { content_name: 'Bolo de pote para vender', content_category: 'receitas', value: 19.9, currency: 'BRL' },
    '/ia/kit/': { content_name: 'Kit de Prompts', content_category: 'renda extra com IA', value: window.MNR_PRECO_KIT || 19, currency: 'BRL' },
    '/ia/': { content_name: 'Do Celular ao Balcão', content_category: 'renda extra com IA', value: 47, currency: 'BRL' }
  };
  var caminho = location.pathname.replace(/^\/maonarenda-site/, '');
  if (produtos[caminho]) fbq('track', 'ViewContent', produtos[caminho]);

  // baixar o guia grátis conta como Lead
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href$=".pdf"]');
    if (a) fbq('track', 'Lead', { content_name: 'Guia 7 ideias de renda extra' });
  });

  var busca = location.search.replace(/^\?/, '');
  if (!busca) return;
  document.addEventListener('DOMContentLoaded', function () {
    var links = document.querySelectorAll('a[href^="https://pay.kiwify.com.br/"]');
    for (var i = 0; i < links.length; i++) {
      links[i].href += (links[i].href.indexOf('?') < 0 ? '?' : '&') + busca;
    }
  });
})();
