# Plataforma CAIUS — Multi Atendimento - TODO

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

## Fase 7: CAIUS — Gestão Administrativa

### Banco de Dados
- [x] Tabelas: sectors, protocols, tramitations, officialDocuments, adminProcesses, ombudsmanManifestations, documentTemplates, electronicSignatures, auditLogs, aiProviders, aiUsageLogs
- [x] Coluna NUP em todas as tabelas relevantes
- [x] Índices e constraints de unicidade do NUP

### Backend (tRPC)
- [x] Router: sectors (setores e unidades)
- [x] Router: protocols (protocolo digital com NUP)
- [x] Router: tramitations (tramitação entre setores)
- [x] Router: officialDocuments (documentos oficiais)
- [x] Router: adminProcesses (processos administrativos)
- [x] Router: ombudsman (ouvidoria e manifestações)
- [x] Router: documentTemplates (modelos de documentos)
- [x] Router: electronicSignatures (assinatura eletrônica)
- [x] Router: auditLogs (trilha de auditoria)
- [x] Router: aiProviders (integração ChatGPT/Gemini)
- [x] API pública de consulta por NUP (sem autenticação)

### Interface
- [x] Renomear plataforma para CAIUS com novo visual
- [x] Atualizar sidebar com novos módulos organizados por grupo
- [x] Página: Protocolo Digital (abertura + NUP)
- [x] Página: Tramitação Interna (encaminhar entre setores)
- [x] Página: Consulta Pública por NUP (área externa sem autenticação)
- [x] Página: Documentos Oficiais (memorandos, ofícios, despachos)
- [x] Página: Processos Administrativos
- [x] Página: Ouvidoria e Manifestações
- [x] Página: Modelos de Documentos com geração por IA
- [x] Página: Auditoria e Logs
- [x] Página: Integração com IA (assistente de redação)
- [x] Página: Configurações de provedores de IA (OpenAI, Gemini, Anthropic)
- [x] Página: Setores com hierarquia organizacional

## Fase 8: Testes e Entrega
- [x] 34 testes automatizados passando (3 arquivos de teste)
- [x] TypeScript sem erros
- [x] Checkpoint final e entrega
