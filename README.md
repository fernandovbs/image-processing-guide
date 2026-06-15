# Laboratorio de Filtros de Imagem (DIP)

Aplicacao web interativa para estudo de Processamento Digital de Imagens (Digital Image Processing), com foco em filtros e operacoes classicas de imagem.

A interface organiza o conteudo em uma estrutura navegavel com:
- Dominio espacial (suavizacao e agucamento)
- Dominio da frequencia (passa-baixa, passa-alta e filtros seletivos)
- Processamento morfologico

## Tecnologias

- React 19
- TypeScript
- Vite 7
- Tailwind CSS
- Lucide React (icones)

## Requisitos

- Node.js 18+ (recomendado LTS)
- npm 9+

## Como executar localmente

1. Instale as dependencias:

```bash
npm install
```

2. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

3. Abra a URL exibida no terminal (normalmente `http://localhost:5173`).

## Scripts disponiveis

- `npm run dev`: inicia o ambiente de desenvolvimento com hot reload.
- `npm run build`: gera a versao de producao em `dist/`.
- `npm run preview`: serve localmente o build de producao para validacao.

## Estrutura do projeto

```text
.
|- index.html
|- laborat_rio_de_filtros_de_imagem.tsx
|- netlify.toml
|- package.json
|- src/
|  |- App.tsx
|  |- main.tsx
|  |- styles.css
|  |- vite-env.d.ts
|- tailwind.config.cjs
|- postcss.config.cjs
|- tsconfig.json
|- vite.config.ts
```

Observacao: `src/App.tsx` apenas reexporta o componente principal definido em `laborat_rio_de_filtros_de_imagem.tsx`.

## Deploy

O projeto inclui configuracao para Netlify em `netlify.toml`, com publicacao da pasta `dist/` apos `npm run build`.

## Objetivo educacional

Este projeto foi criado para apoiar estudos de DIP, conectando conceitos teoricos (ex.: filtros de media, mediana, Sobel, Laplaciano, Butterworth, operacoes de erosao/dilatacao etc.) a uma visualizacao mais didatica em interface web.
