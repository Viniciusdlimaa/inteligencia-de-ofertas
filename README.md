# Offer Intelligence

Ferramenta pessoal para organização, monitoramento e análise de ofertas digitais.

Esta é a **versão 1: interface navegável**, com dados fictícios. Ainda não há
banco de dados, autenticação, IA ou integrações externas — isso é proposital,
conforme o escopo definido para esta etapa.

## Como instalar

```bash
cd offer-intelligence
npm install
```

## Como executar

```bash
npm run dev
```

Acesse `http://localhost:5173`.

Para gerar a versão de produção (arquivos estáticos):

```bash
npm run build
npm run preview
```

## Estrutura de pastas

```
src/
├── components/       Componentes reutilizáveis de UI
│   ├── Layout.jsx        Estrutura da página (sidebar + topo + conteúdo)
│   ├── Sidebar.jsx        Menu lateral de navegação
│   ├── Topbar.jsx         Cabeçalho com título e ação principal
│   ├── Panel.jsx          Bloco/seção com borda, usado em todas as páginas
│   ├── StatCell.jsx       Célula de métrica do dashboard
│   ├── TrendBadge.jsx     Selo de tendência (Alta / Estável / Queda)
│   ├── ScoreMeter.jsx     Estrutura visual do score
│   └── Sparkline.jsx      Gráfico de linha simples em SVG (sem lib externa)
│
├── pages/            Uma pasta por tela do fluxo principal
│   ├── Dashboard.jsx      Visão geral
│   ├── Offers.jsx         Listagem de ofertas com busca e filtros
│   ├── NewOffer.jsx       Formulário de cadastro
│   └── OfferDetails.jsx   Detalhes + histórico diário + gráfico
│
├── data/
│   └── mockData.js    Dados fictícios (ofertas, histórico, atualizações)
│
├── utils/
│   └── format.js      Formatação de datas, percentuais e faixas de score
│
├── styles/
│   ├── tokens.css     Variáveis de design (cores, tipografia, espaçamento)
│   └── global.css     Reset e estilos base
│
├── App.jsx            Rotas da aplicação
└── main.jsx           Ponto de entrada (React Router + estilos globais)
```

Cada componente `.jsx` tem um arquivo `.css` correspondente ao lado, com o
mesmo nome — por exemplo, `Sidebar.jsx` e `Sidebar.css`.

## Onde ficam os principais componentes

- **Navegação e layout geral**: `src/components/Layout.jsx`, `Sidebar.jsx`, `Topbar.jsx`
- **Cards do dashboard**: `src/components/StatCell.jsx`
- **Tabela de ofertas e filtros**: `src/pages/Offers.jsx`
- **Formulário de nova oferta**: `src/pages/NewOffer.jsx`
- **Histórico diário e gráfico de uma oferta**: `src/pages/OfferDetails.jsx`
- **Estrutura visual do score**: `src/components/ScoreMeter.jsx`
- **Dados de exemplo**: `src/data/mockData.js`

## Sobre o Score

Por enquanto o score é apenas um **número fictício armazenado em cada
oferta**, exibido através do componente `ScoreMeter`. Nenhum cálculo real
acontece ainda. Quando a lógica for implementada (com base em crescimento de
anúncios, consistência, tempo de mercado e tendência recente), o único ponto
que precisa mudar é o valor de `score` que cada oferta recebe — a interface
que exibe esse valor já está pronta.

## Como adicionar novas funcionalidades depois

Este projeto foi organizado para que a próxima etapa (banco de dados,
persistência de formulário, cálculo real de score) exija o mínimo de
mudanças estruturais:

1. **Banco de dados / API**
   Substitua as importações de `src/data/mockData.js` por chamadas a uma
   API (ex.: `fetch` ou um cliente de banco). O formato de cada objeto de
   oferta em `mockData.js` já reflete os campos que devem vir do backend —
   use-o como contrato de dados.

2. **Persistir o formulário de Nova Oferta**
   Em `src/pages/NewOffer.jsx`, a função `handleSubmit` é o único lugar que
   precisa mudar: hoje ela só reseta o formulário; no futuro, ela vai enviar
   `form` para a API/banco antes de resetar.

3. **Cálculo real do score**
   Crie uma função (por exemplo `src/utils/score.js`) que recebe o
   histórico de uma oferta e devolve um número de 0 a 100. Troque o valor
   fixo `oferta.score` por essa função nos lugares em que ele é usado
   (`Dashboard.jsx`, `Offers.jsx`, `OfferDetails.jsx`).

4. **Novas páginas**
   Crie o arquivo em `src/pages/`, adicione a rota em `src/App.jsx` e, se
   for necessário um novo item de menu, adicione em
   `src/components/Sidebar.jsx` (array `NAV_ITEMS`).

5. **Novos componentes visuais**
   Siga o padrão de `src/components/`: um `.jsx` e um `.css` com o mesmo
   nome, usando as variáveis definidas em `src/styles/tokens.css` para
   manter a identidade visual consistente.
