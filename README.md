# Buffet Manager Pro — Gomes Buffet

Protótipo navegável de um ERP completo para empresas de buffet e eventos, desenvolvido para a **Gomes Buffet**.

## O que é

Um único arquivo HTML autocontido (`gomes-buffet-manager.html`) que roda em qualquer navegador, sem instalação, simulando a experiência completa do sistema:

- **Dashboard** — indicadores em tempo real (eventos do dia/semana/mês, receitas, lucro, alertas inteligentes)
- **Agenda** — calendário estilo Google Calendar (dia/semana/mês/ano)
- **Orçamentos** — assistente guiado com estimativa automática de ingredientes por convidado, cálculo de custos, margem e preço sugerido
- **Clientes** — cadastro completo com histórico de eventos e total contratado
- **Eventos** — gerados automaticamente na aprovação de um orçamento, com checklist operacional
- **Financeiro** — receitas, despesas, fluxo de caixa, títulos em atraso
- **Equipe** — funcionários, diárias e escalas
- **Aluguéis** — equipamentos com histórico de preços
- **Cardápios** — cadastro de cardápios e ingredientes usados na estimativa dos orçamentos

Identidade visual na cor da logo (verde `#1B4332` + dourado `#C9A227`), com modo claro/escuro.

## Como usar

Basta abrir `gomes-buffet-manager.html` no navegador. Os dados ficam salvos localmente (`localStorage`) — não há backend nesta versão.

## Próximos passos (versão de produção)

Este protótipo serve como especificação viva de UX/fluxo. A versão definitiva será construída com:

- **Frontend:** Next.js, React, TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **Backend:** Node.js, API REST, Prisma ORM
- **Banco de dados:** PostgreSQL (Supabase)
- **Autenticação:** JWT com níveis de acesso (Administrador, Financeiro, Comercial, Operacional)
- **Hospedagem:** Vercel + Supabase
- Arquitetura SaaS multiempresa, pronta para escalar
