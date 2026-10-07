# Créditos das imagens de fundo

As fotos vêm do [Unsplash](https://unsplash.com/license) e foram tratadas
para duotone navy/dourado, com desfoque e escurecimento aplicados.

| Arquivo | Origem |
| --- | --- |
| `bg-sobre.jpg` | `images.unsplash.com/photo-1517180102446-f3ece451e9d8` — editor de código |
| `bg-trabalho.jpg` | `images.unsplash.com/photo-1521737711867-e3b97375f902` — equipe trabalhando |
| `bg-projetos.jpg` | `images.unsplash.com/photo-1544197150-b99a580bb7a8` — patch panel de rede |
| `bg-stack.jpg` | `images.unsplash.com/photo-1526374965328-7f61d4dc18c5` — placa de circuito |
| `bg-contato.jpg` | `images.unsplash.com/photo-1516116216624-53e697fedbea` — VSCode em tema escuro |

## O que fazer antes de publicar

A Licença do Unsplash permite uso livre, inclusive comercial, e **não exige
atribuição** — por isso nada é obrigatório. Ainda assim:

1. Confirme a origem de cada foto em <https://unsplash.com> (os IDs acima são
   estáveis e levam à imagem original).
2. Se quiser creditar, acrescente o nome do autor em um `<footer>` ou em
   `LEIA-ME` do repositório.

## Substituir uma foto

Mantenha o mesmo pipeline para não quebrar o estilo:

1. Baixe a nova imagem em alta resolução.
2. Converta para duotone mapeando o cinza entre `#071019` (sombra) e
   `#d8b26a` (luz).
3. Reaplique o desfoque e o escurecimento — é o que garante contraste com
   o texto e equaliza o brilho entre as seções.
4. Salve como JPEG progressivo, ~1800 px de largura, quality 74 (~50 KB).
