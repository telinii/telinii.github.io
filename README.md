# Portfólio — Luca Telini Crozara

Site estático de portfólio pessoal, feito apenas com **HTML, CSS e JavaScript puros**.
Sem frameworks, sem build, sem dependências. Publicação via GitHub Pages.

## Estrutura

```
portfolio/
├── index.html            # página única (5 seções: Sobre, Trabalho, Projetos, Stack, Contato)
├── 404.html              # página de erro do GitHub Pages
├── sitemap.xml
├── robots.txt
├── site.webmanifest      # PWA básico (ícone + cores)
├── .nojekyll             # desliga o Jekyll no Pages
└── assets/
    ├── tools/circuit.py   # gerador dos circuitos
    ├── css/main.css
    ├── js/main.js
    ├── img/
    │   ├── portrait.jpg       # sua foto (retrato 4:5, exiba no hero)
    │   ├── portrait-quad.jpg  # versão quadrada (ícone do PWA)
    │   ├── og.jpg            # preview 1200×630 para LinkedIn/WhatsApp
    │   └── favicon.svg
    ├── bg/                # fundos com parallax (duotone quase-preto/azul)
    ├── circuit/           # circuitos de PCB (SVG inline no HTML)
        │   ├── bg-sobre.jpg
    │   ├── bg-projetos.jpg
    │   ├── bg-stack.jpg
    │   ├── bg-contato.jpg
    │   └── CREDITOS.md
    └── cv/               # ← coloque seu PDF aqui (ver abaixo)
```

## Seção "Trabalho"

A seção `Trabalho` é separada de `Projetos` de propósito: uma é trabalho
contratado e pago, a outra é o que você construiu por conta própria. Juntar
as duas faz o recruitersortir do seu lado.

Para adicionar ou editar uma entrada, mexa no `<article class="role">`
dentro de `#trabalho` no `index.html`.

**Pendência:** se o cliente final for liberado para divulgação, acrescente
uma linha em `.role-meta` — o texto atual cita apenas a Teckiwi, que é o
contratante verificável.

## Fundos com parallax

Cada seção (`Sobre`, `Projetos`, `Aprendendo`, `Stack`, `Contato`) tem uma
foto de fundo em duotone navy que se move suavemente com o scroll.

Para trocar ou adicionar:

1. Coloque a imagem processada em `assets/bg/`.
2. No `index.html`, adicione `class="section has-bg"`, o atributo
   `data-bg="assets/bg/arquivo.jpg"` e a div
   `<div class="section-bg" aria-hidden="true"></div>` como primeiro filho.

O movimento é controlado em `assets/js/main.js` (`initParallax`):

- **Um único `requestAnimationFrame`** para todas as seções — nada de um
  listener por seção.
- **Interpolação (lerp)** de 0.12, que faz o fundo "acompanhar" o scroll em
  vez de saltar quadro a quadro.
- Só `transform` e `opacity` são animados, ambos baratos na GPU.
- A URL da imagem é resolvida para **absoluta** antes de virar custom
  property: dentro de `var()` o caminho seria resolvido relativo ao CSS.

Ajuste de sensação: `range` (0.15) controla a amplitude do deslocamento e
`target` (0.55) a opacidade máxima no centro da tela. Abaixo de ~0.35 o
fundo parece quebrado; acima de ~0.5 começa a competir com o texto.

Sob `prefers-reduced-motion` a imagem continua visível, porém fixa — sem
deslocamento e sem fade.

Os cartões de projeto usam `backdrop-filter` para deixar o fundo aparecer
através deles; sem isso os cartões opacos esconderiam a foto da seção.

## Sobre a foto

`assets/img/portrait.jpg` aparece no topo da página, ao lado do seu nome.
Se trocar a foto, mantenha o enquadramento (rosto no terço superior) e
regere as derivados ou apague `portrait-quad.jpg` e `og.jpg` — o card de
preview do LinkedIn é montado a partir delas.

## Marcas das tecnologias

Os ícones da seção Stack vêm do [Simple Icons](https://simpleicons.org)
(CC0, domínio público).

Eles são **embutidos como `data:` URI direto no `main.css`**, e não como
arquivos `.svg` separados. Isso foi proposital: `mask-image` apontando para
um SVG externo é sujeito a CORS e **não funciona ao abrir o `index.html`
pelo `file://`** — o navegador bloqueia com origem `null` e todos os ícones
somem. Com `data:` URI não há requisição nenhuma, então funciona em
`file://`, em HTTP local e no GitHub Pages, sem caso especial. O custo é de
~25 KB de CSS a mais, que comprimem para menos de 10 KB no servidor.

A cor vem de `currentColor`, então os ícones acompanham o tema sozinhos —
não existe variante clara/escura para manter.

Para adicionar uma tecnologia:

1. Pegue o `d` do path em `https://cdn.simpleicons.org/<slug>`.
2. Monte a URI:
   `url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path d='...'/></svg>")`
3. Ponha em `.ti--<apelido>` no `main.css`.
4. No `index.html`, use `<span class="ti ti--<apelido>"></span>`.

**SQL, JWT, bcrypt e Joi não têm marca canônica** — são padrões e
bibliotecas, não produtos. Para esses use `ti--padrao`, que desenha um
quadrado sólido neutro em vez de forjar um logo que não existe.

## Circuitos

Cada seção tem um circuito de PCB no fundo, com um pulso azul que percorre as
trilhas em loop contínuo. Vive em `assets/circuit/*.svg` e é **embutido inline**
no `index.html` — não é `<img>` nem `background-image`, porque o CSS precisa
estilizar os grupos internos (`.pc-trace`, `.pc-pulse`, `.pc-via`).

### Como o pulso funciona

`stroke-dashoffset` animado com `stroke-dasharray: 90 2400`. A soma é fechada
(90 + 2400 = 2490, o mesmo valor do `stroke-dashoffset` final), então o loop
é exato em qualquer comprimento de trilha — não há "piscar" no fim do percurso.

O brilho vem de **duas camadas**: um halo largo (`stroke-width: 9`, opacidade
.16) e um núcleo fino (`2.2`). Filtrar com `feGaussianBlur` daria resultado
parecido e muito mais caro, porque filtro rasteriza a cada quadro.

### Desempenho — a parte que importa

`stroke-dashoffset` **não é animado pela GPU**: dispara repaint a cada quadro.
Medido neste site, com as cinco seções animando juntas:

| | antes | depois |
|---|---|---|
| animações simultâneas | 307 | ~128 (só as seções visíveis) |
| quadro mediano | 17,3 ms | 16,7 ms |
| p95 | 23,9 ms | 18,5 ms |
| pior quadro | 40,8 ms | 22,2 ms |

Duas medidas resolveram:

1. **Metade das vias** — o gerador emite `pts[1:-1][::2]`. Com todas as juntas
   animated, o total passava de 300.
2. **Só anima o que está na tela** — `initCircuits()` no JS usa um
   `IntersectionObserver` com `rootMargin: 25%` e liga/desliga a classe
   `is-live`. O CSS pausa com `animation-play-state: paused`. A margem é
   generosa de propósito, senão o circuito pisca liga-desliga na borda.

Sob `prefers-reduced-motion` a corrente para, mas a placa continua desenhada:
some o movimento, não as trilhas.

### Regerar

```bash
python3 tools/circuit.py assets/circuit/sobre.svg 11 8
#            <saída>                               <seed> <nº de trilhas>
```

A seed é fixa por seção — trocar produz outro desenho. Depois de regerar é
preciso **reembutir** o SVG no `index.html`, porque ele vive inline lá.

## Sistema de movimento

Todo o hover do site sai dos mesmos três tokens, declarados em `:root`:

```css
--ease:   cubic-bezier(.22, .68, .32, 1);  /* sem overshoot */
--dur-1:  .16s;   /* cor e borda */
--dur-2:  .28s;   /* deslocamento curto */
--dur-3:  .5s;    /* preenchimentos e revelações */
```

Usar um único par de tokens é o que faz a animação parecer um **sistema**
em vez de efeitos soltos. Se for mexer em qualquer transição, passe pelos
tokens em vez de escrever um valor solto.

Três regras que o bloco `14. Interações` segue:

1. **Só `transform`, `opacity`, `background` e `border-color`.** Nada que
   altere tamanho, padding ou posição — essas disparam reflow e a página
   treme durante o hover.
2. **Deslocamento máximo de 3px.** Movimento que se nota demais vira ruído e
   denuncia template.
3. **Curva sem overshoot.** `cubic-bezier` com volta elástica lê como
   brinquedo; a curva chosen é só aceleração e desaceleração.

O bloco inteiro está dentro de `@media (hover: hover)`. Sem isso, em telas
touch o `:hover` fica preso depois do toque e a página parece quebrada.

Efeito mais recenteado: a régua dourada de 2px que desce pela borda
esquerda da faixa do projeto, e a das listas de repositórios e contato.
São `::before` com `transform: scaleY()`. **Não coloque `transition` na
regra base** — ela precisa sumir na hora quando o mouse sai, não esmaecer
de volta.

## Antes de publicar

1. **Coloque seu PDF de currículo** em `assets/cv/` com o nome
   `luca-telini-crozara-cv.pdf`. O botão "Baixar CV" já aponta para esse caminho —
   enquanto o arquivo não existir, o link apontará para um 404.
2. Se publicar em um repositório que não seja `telinii.github.io`, atualize
   `robots.txt`, `sitemap.xml` e as tags `og:url` no `index.html`.
3. Confira os textos em `index.html`: e-mail, links e descrições dos projetos.

## Publicar no GitHub Pages

```bash
cd "/home/scrowl/Área de trabalho/Projects/portfolio"

git init
git add .
git commit -m "Portfólio: site estático inicial"
git branch -M main
git remote add origin https://github.com/telinii/telinii.github.io.git
git push -u origin main
```

Depois, no repositório: **Settings → Pages → Source: Deploy from a branch →
`main` / `(root)`**. Em ~1 minuto o site fica em
`https://telinii.github.io`.

## Detalhes técnicos

- **Tema claro/escuro** — navy como padrão, claro como alternativa. A preferência é
  salva em `localStorage` e um script inline no `<head>` evita o "flash" de tema
  errado no primeiro carregamento.
- **Zero JavaScript desnecessário** — sem jQuery, sem polyfills, sem CDN de fontes
  além do Google Fonts (com fallback de sistema caso a fonte não carregue).
- **Acessibilidade** — HTML semântico, `aria-*` nos controles, skip link, foco visível,
  e todo o movimento desligado sob `prefers-reduced-motion`.
- **Impressão** — folha de estilo de impressão remove cabeçalho, rodapé e botões.
- **Lightbox/galeria, fontes locais e analytics** foram deliberadamente deixados de
  fora para manter a página rápida e sem ruído visual.
