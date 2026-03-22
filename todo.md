# Plataforma Multi Atendimento - TODO

## Fase 1: Banco de Dados e Dependências
- [x] Schema do banco de dados (contas, conversas, mensagens, tickets, agentes)
- [x] Instalar dependências: @baileys/whatsapp-web, socket.io, nodemailer, imapflow, qrcode
- [x] Aplicar migrações SQL

## Fase 2: Backend (tRPC Routers)
- [x] Router de autenticação e controle de permissões (admin/agente)
- [x] Router de contas (WhatsApp, Instagram, E-mail)
- [x] Router de conversas e mensagens
- [x] Router de tickets e atribuição
- [x] Router de fila de atendimento
- [x] Router de relatórios e analytics
- [x] WebSocket/Socket.io para notificações em tempo real
- [x] Integração WhatsApp via Baileys (QR Code)
- [x] Integração Instagram via OAuth
- [x] Integração E-mail via IMAP/SMTP

## Fase 3: Layout e Design System
- [x] Design system: paleta de cores elegante (tema escuro OKLCH), tipografia Inter
- [x] OmniLayout customizado para plataforma omnichannel
- [x] Sidebar com navegação principal (ícones + tooltips)
- [x] Página Home/Dashboard com métricas resumidas

## Fase 4: Integrações de Canais
- [x] Tela de gerenciamento de contas WhatsApp (QR Code)
- [x] Tela de gerenciamento de contas Instagram (OAuth)
- [x] Tela de gerenciamento de contas E-mail (IMAP/SMTP)

## Fase 5: Inbox e Tickets
- [x] Inbox unificado com todas as conversas de todos os canais
- [x] Filtros por canal, status, agente e data
- [x] Tela de conversa individual com histórico completo
- [x] Sistema de tickets: criar, atribuir, resolver
- [x] Fila de atendimento com distribuição automática
- [x] Notificações em tempo real (novas mensagens, atribuições)

## Fase 6: Relatórios e Analytics
- [x] Painel de relatórios com métricas de atendimento
- [x] Volume de atendimentos por canal e período
- [x] Desempenho por agente
- [x] Histórico de conversas com busca e filtros avançados

## Fase 7: Finalização
- [x] Testes vitest para routers principais (16 testes passando)
- [x] Ajustes visuais e responsividade
- [x] Checkpoint final e entrega
