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

## Fase 9: CAIUS Avançado — 29 Novas Funcionalidades

### Banco de Dados (Fase 9)
- [x] Tabela: serviceTypes (tipos de atendimento configuráveis com SLA, fluxo, sigilo)
- [x] Tabela: formTemplates (modelos de formulários dinâmicos)
- [x] Tabela: formFields (campos configuráveis por formulário)
- [x] Tabela: attachmentConfigs (configuração de anexos por tipo)
- [x] Tabela: contextHelp (ajuda contextual por funcionalidade/perfil)
- [x] Tabela: onlineSessions (sessões ativas de usuários)
- [x] Tabela: institutionalConfig (identidade visual, logomarca, cores, textos)
- [x] Tabela: searchIndex (índice de pesquisa global)
- [x] Tabela: userRegistrations (cadastro próprio com e-mail/senha)

### Backend (Fase 9)
- [x] Router: serviceTypes (CRUD tipos de atendimento com regras e SLA)
- [x] Router: formTemplates (CRUD formulários dinâmicos)
- [x] Router: formFields (CRUD campos com validação, máscara, condicional)
- [x] Router: contextHelp (CRUD ajuda contextual por funcionalidade)
- [x] Router: onlineSessions (listar, encerrar sessões, monitoramento)
- [x] Router: globalSearch (pesquisa global por NUP, assunto, tipo, setor)
- [x] Router: institutionalConfig (identidade visual, logomarca, cores)
- [x] Router: attachments (upload S3, configs de anexo por tipo)
- [x] Router: userRegistration (cadastro próprio com e-mail/senha)

### Interface (Fase 9)
- [x] Toggle modo claro/escuro persistente por usuário (ThemeContext + sidebar)
- [x] Barra de pesquisa global com painel lateral e resultados agrupados por categoria
- [x] Componente GlobalSearchResults com navegação direta para entidades
- [x] Página: Tipos de Atendimento (configuração de serviços, SLA, campos obrigatórios)
- [x] Página: Construtor de Formulários Dinâmicos (campos, tipos, validações, ordem)
- [x] Página: Gerenciamento de Anexos (configs de tipos, tamanhos, obrigatoriedade)
- [x] Página: Configurações Institucionais (logomarca, cores, textos, dados do órgão)
- [x] Página: Sessões Online (monitoramento de usuários ativos, encerramento de sessão)
- [x] Página: Ajuda Contextual (admin) — tooltips, modais, instruções por tela
- [x] Sidebar atualizado com módulos avançados (admin only)

## Fase 10: Testes Finais e Entrega
- [x] 47 testes automatizados passando (4 arquivos de teste)
- [x] TypeScript sem erros (0 erros de compilação)
- [x] Servidor rodando corretamente (HTTP 200)
- [x] Checkpoint final e entrega

## Fase 11: Estrutura Organizacional — Lei Complementar nº 010/2025

### Banco de Dados
- [x] Tabela: orgUnits (unidades organizacionais hierárquicas com parentId, sigla, nível, tipo)
- [x] Tabela: positions (cargos com nível hierárquico, tipo de provimento, unidade vinculada)
- [x] Tabela: userAllocations (lotações de usuários: unidade, cargo, perfil, datas)
- [x] Tabela: orgInvites (convites por e-mail com status, token, prazo, unidade de destino)
- [x] Tabela: allocationHistory (histórico de movimentação funcional)

### Seed de Dados (Lei 010/2025)
- [x] 17 órgãos principais com siglas (GABPRE, GABVICE, PGM, CGM, SCC, SEPLAN, SEFIN, SEMAS, SEDEC, SECULT, SEMAGRI, SEDUC, SEINFRA, SESAU, SEMAM, SETRANS, SEMOB)
- [x] Subestruturas do Gabinete do Prefeito (Diretoria de Redação Oficial, Comunicação, Projetos Estratégicos, Junta de Serviço Militar)
- [x] Subestruturas da PGM, CGM, SCC, SEPLAN, SEFIN, SEMAS, SEDEC, SECULT, SEMAGRI
- [x] Subestruturas da SEDUC, SEINFRA, SESAU, SEMAM, SETRANS, SEMOB, GABVICE
- [x] Cargos: Secretário, Secretário Executivo, Diretor, Coordenador, Gerente, Supervisor, Chefe, Assessor Técnico, Assessor Especial

### Backend
- [x] Router: orgUnits (CRUD, árvore hierárquica, busca por nível/tipo/secretaria)
- [x] Router: positions (CRUD cargos, vinculação a unidades)
- [x] Router: userAllocations (alocar/desalocar usuário, histórico, múltiplas unidades)
- [x] Router: orgInvites (criar convite, reenviar, cancelar, aceitar via token)
- [x] Router: orgChart (dados do organograma para visualização)

### Interface
- [x] Página: Estrutura Organizacional com árvore hierárquica navegável e organograma visual
- [x] Componente: OrgTree — árvore interativa com expand/collapse por nível
- [x] Componente: OrgChartVisual — organograma visual com cards por unidade
- [x] Visualização por secretaria, nível hierárquico e unidade
- [x] Ação "Adicionar Usuário" em cada nó da árvore hierárquica
- [x] Formulário de convite por e-mail vinculado ao nível hierárquico
- [x] Página: Gestão de Cargos (CRUD com nível, tipo, unidade)
- [x] Página: Alocação de Usuários (lotação, cargo, perfil, datas, histórico)
- [x] Página: Convites Pendentes (status, reenvio, cancelamento)
- [x] Sidebar: novo grupo "Estrutura Organizacional" com 3 itens (admin only)

## Fase 12: Testes Finais e Entrega
- [x] 60 testes automatizados passando (5 arquivos de teste)
- [x] TypeScript sem erros (0 erros de compilação)
- [x] Servidor rodando corretamente (HTTP 200)
- [x] Checkpoint final e entrega

## Fase 13: Melhoria da Tela de Login
- [x] Botão "Entrar com Manus" com logo e identidade visual explícita
- [x] Tela de login redesenhada com descrição do sistema e instruções de acesso
- [x] Layout dividido em dois painéis: branding (esquerda) + formulário de login (direita)
- [x] Cards de funcionalidades na tela de login (Inbox, Protocolo, Estrutura Org., Auditoria)
- [x] Acesso público separado com link para Consulta por NUP

## Fase 14: Campos/Documentos em Tipos de Atendimento + Central do Cidadão

### Banco de Dados
- [x] Tabela: serviceTypeFields (campos obrigatórios/complementares por tipo de atendimento)
- [x] Tabela: serviceTypeDocuments (documentos exigidos por tipo de atendimento)

### Backend
- [x] Router: serviceTypeFields (CRUD campos por tipo, obrigatório/complementar, tipo de dado, ordem)
- [x] Router: serviceTypeDocuments (CRUD documentos por tipo, obrigatório/complementar, descrição)
- [x] Router: cidadao.listServices (listagem pública de serviços disponíveis)
- [x] Router: cidadao.getService (detalhes públicos de um serviço com campos e documentos)

### Interface
- [x] ServiceTypes: aba "Campos" para configurar campos obrigatórios e complementares
- [x] ServiceTypes: aba "Documentos" para configurar documentos exigidos
- [x] ServiceTypes: indicadores visuais de obrigatório/complementar em cada item
- [x] Página: Central do Cidadão (/central-cidadao) — pública, sem autenticação
- [x] Central do Cidadão: listagem de todos os serviços disponíveis com busca e filtros por categoria
- [x] Central do Cidadão: card de serviço com nome, descrição, SLA, setor responsável
- [x] Central do Cidadão: modal de detalhes com campos e documentos necessários (obrigatórios/complementares)
- [x] Central do Cidadão: link para abrir protocolo ou acessar a plataforma
- [x] Tela de login: botão "Central de Serviços ao Cidadão" destacado

## Fase 15: Testes Finais e Entrega
- [x] 73 testes automatizados passando (6 arquivos de teste)
- [x] TypeScript sem erros (0 erros de compilação)
- [x] Servidor rodando corretamente (HTTP 200)
- [x] Checkpoint final e entrega

## Fase 16: Correção de Bugs Críticos de Navegação e Layout
- [x] Menus sumindo — OmniLayout reescrito com sidebar expandido (240px) com labels visíveis + barra superior
- [x] Toggle claro/escuro — restaurado no header com ícones Sun/Moon e ThemeContext switchable
- [x] Inbox — corrigido com prop fullHeight + h-full para layout completo ao abrir conversa
- [x] Protocolos, Processos, Documentos, Ouvidoria, Modelos — páginas acessíveis (problema era crash do servidor por db-service-config, resolvido)
- [x] TypeScript: 0 erros de compilação
- [x] Servidor rodando corretamente (HTTP 200)
## Fase 17: Correções Estruturais — Menu, Inbox, Gestão Pública, Central do Cidadão, Consultar Protocolo

### Correção 6 — Central de Serviços do Cidadão
- [x] Remover fundo cinza indevido da Central de Serviços do Cidadão
- [x] Aplicar cor padrão do sistema (bg-background) em modo claro e escuro
- [x] Verificar containers internos com cor divergente
- [x] Validar desktop e mobile

### Correção 7 — Consultar Protocolo (404)
- [x] Identificar causa do erro 404 (link apontava para /consulta-publica, rota era /consulta)
- [x] Criar/corrigir rota /consultar-protocolo no App.tsx (3 aliases: /consulta, /consultar-protocolo, /consulta-publica)
- [x] Verificar se página existe e está registrada (PublicConsulta.tsx existia e funcionava)
- [x] Garantir busca por NUP, status e histórico básico
- [x] Testar acesso pelo menu e URL direta

### Correção 1 — Menu Lateral
- [x] Menu fechado por padrão ao carregar (defaultOpen = false)
- [x] Submenus abrem APENAS por clique no item pai
- [x] Submenus fecham por clique no item pai
- [x] Sem expansão automática por hover, foco ou rota ativa
- [x] Rota ativa destacada sem forçar abertura do grupo

### Correção 2 — Inbox
- [x] Reconstruir lógica de carregamento inicial
- [x] Atualização automática (polling a cada 10s/5s)
- [x] Listagem de conversas sem duplicidade
- [x] Abertura de conversa sem tela quebrada (layout h-full robusto)
- [x] Troca de conversa sem travamento (reset messageText ao trocar)
- [x] Vínculo com canal e conta
- [x] Exibição do responsável e status de leitura

### Correção 3 — Gestão Pública (Verificação)
- [x] Protocolos (NUP): página existente e funcional (391 linhas)
- [x] Processos Administrativos: página existente e funcional (256 linhas)
- [x] Documentos Oficiais: página existente e funcional (344 linhas)
- [x] Ouvidoria: página existente e funcional (294 linhas)
- [x] Modelos de Documentos: página existente e funcional (342 linhas)
- [x] TypeScript: 0 erros de compilação
- [x] 73 testes passando

## Fase 18: Correções e Novas Funcionalidades

### Correção A — Central do Cidadão sempre em tema claro
- [x] Forçar light mode na Central do Cidadão independente do tema global do sistema
- [x] Garantir que todas as páginas públicas (/central-cidadao, /consulta, /consultar-protocolo) usem tema claro
- [x] Validar modo claro em desktop e mobile

### Correção B — E-mail não funcionando
- [x] Diagnosticar causa da falha de e-mail (SMTP/IMAP, configuração, logs)
- [x] Melhorar mensagens de erro SMTP/IMAP com dicas por provedor (Gmail, Outlook, etc.)
- [x] Retorno detalhado de erros de conexão para facilitar diagnóstico

### Nova Funcionalidade 32 — Estrutura Administrativa na Central do Cidadão
- [x] Criar página /estrutura-administrativa (pública, sem autenticação)
- [x] Árvore hierárquica navigável (órgãos, secretarias, diretorias, departamentos, setores)
- [x] Exibir competências e atribuições de cada unidade
- [x] Exibir cargos vinculados a cada unidade
- [x] Busca por órgão, setor, cargo ou serviço
- [x] Filtro por tipo de unidade
- [x] Integrar ao menu da Central do Cidadão (botão no header)

### Nova Funcionalidade — Dashboard Administrativo Redesenhado
- [x] Bloco de boas-vindas com saudação dinâmica (bom dia/tarde/noite)
- [x] 8 KPI cards (Conversas Abertas, Pendentes, Resolvidas, Total Mensagens, Contas, Agentes, Protocolos, Total)
- [x] Gráficos: Por Canal (pizza), Por Status (barras de progresso), Por Agente (barras)
- [x] Protocolos Recentes com link direto
- [x] Status das Contas com indicadores de cor
- [x] Alertas quando não há contas conectadas ou agentes disponíveis
- [x] Botão Atualizar e acesso rápido ao Inbox
- [x] TypeScript: 0 erros de compilação
- [x] 73 testes passando

## Fase 19: Melhorias Estruturais e Novas Funcionalidades

###### Item 1 — Tela de Login Institucional [CONCLUÍDO]al
- [ ] Layout 2 colunas: imagem institucional (esquerda) + card de autenticação (direita)
- [ ] Card com logomarca, título de boas-vindas, campo e-mail, campo senha com toggle visibilidade
- [ ] Link "Esqueci a senha", botão principal de login
- [ ] Divisor "Ou continuar com" + botões: Entrar com Google, Entrar com conta institucional, Entrar com certificado digital
- [ ] Link para Central do Cidadão e rodapé com marca do sistema
- [x] Responsivo (mobile: card centralizado sem imagem)

### Item 2 — Central do Cidadão: Menu Público e Rodapé [CONCLUÍDO]
- [x] Menu superior: Central de Serviços, Transparência, Organograma, Verificar Assinatura Digital, Consulta Prévia Online, Entrar, Cadastrar
- [x] Seção "Encontre o serviço que você precisa" com busca principal
- [x] Serviços em destaque (cards visuais)
- [x] Navegação por categorias (Acessibilidade, Alvarás, Assistência Social, Certidões, etc.)
- [x] Navegação por perfis (Aposentados, Cidadão, Empreendedores, Prestador de Serviços, Servidor)
- [x] Navegação por órgãos responsáveis (Gabinete do Prefeito, Secretarias, etc.)
- [x] Bloco de ajuda ao cidadão com FAQ e tutoriais
- [x] Rodapé com atalhos: Início, Meu Inbox, Central de Serviços, Diário Oficial, Organograma, Transparência, Verificar Assinatura, Consulta Prévia

### Item 3 — Menu Lateral Accordion [CONCLUÍDO]
- [x] Ao abrir um grupo, fechar automaticamente o grupo anterior
- [x] Apenas um grupo expandido por vez
- [x] Submenu abre/fecha apenas por clique
- [x] Rota ativa destacada sem forçar abertura de grupo

### Item 4 — Estrutura Organizacional (Usabilidade) [CONCLUÍDO]
- [x] Corrigir rolagem vertical e horizontal para visualizar toda a estrutura
- [x] Cada item de nível 1 centraliza sua estrutura no painel central
- [x] Expansão organizada sem cortar conteúdo
- [x] Organograma público acessível sem autenticação

### Item 5 — Notificações por Canal de Origem [CONCLUÍDO]
- [x] Regra: notificar pelo mesmo canal de entrada (WhatsApp → WhatsApp, e-mail → e-mail, etc.)
- [x] Eventos: recebimento, início, movimentação, complementação, resposta, conclusão, arquivamento
- [x] Fallback configurável quando canal indisponível
- [x] Pesquisa de satisfação automática ao encerrar atendimento
- [x] Registrar resposta da pesquisa na ficha do usuário

### Item 6 — Aviso de Ligações [CONCLUÍDO]
- [x] Mensagem automática na primeira interação: "Este canal não recebe ligações telefônicas..."
- [x] Mensagem parametrizável por canal
- [x] Opção de desativar por canal/unidade

### Item 7 — Transcrição de Áudio no Inbox [CONCLUÍDO]
- [x] Detectar mensagens de áudio recebidas
- [x] Transcrever automaticamente via Whisper API (procedure voice.transcribe)
- [x] Exibir áudio original e transcrição lado a lado
- [x] Permitir copiar, editar e buscar na transcrição
- [x] Associar transcrição ao histórico do atendimento

### Item 8 — Convite por E-mail (Correção) [CONCLUÍDO]
- [x] Verificar e corrigir serviço de envio de e-mail para convites
- [x] Status do convite: pendente, enviado, entregue, falhou, aceito, expirado
- [x] Logs de tentativa de envio
- [x] Reenvio manual do convite pela interface

### Item 9 — Consulta Pública Aprimorada [CONCLUÍDO]
- [x] Busca por NUP
- [x] Busca por número + CPF/CNPJ
- [x] Busca por código de documento
- [x] Consulta de andamento e assinatura
- [x] Histórico básico conforme permissão
- [x] Anexos e respostas quando permitidos

## Fase 20: Reestruturação da Gestão Pública e Experiência do Cidadão [CONCLUÍDO]

### Backend
- [x] Adicionar campo isPublic, publicationStatus (draft/published/inactive/restricted) e subjects em serviceTypes
- [x] Tabela: serviceSubjects (assuntos por tipo de atendimento com isPublic, formulário vinculado, documentos, SLA)
- [x] Procedure: serviceTypes.publish / serviceTypes.unpublish
- [x] Procedure: serviceSubjects.list / create / update / delete
- [x] Procedure pública: cidadao.getServiceDetail (tipo + assuntos públicos + campos + documentos)
- [x] Procedure pública: cidadao.submitRequest (criar protocolo/ouvidoria a partir do formulário do cidadão)

### Tela Administrativa — Gestão Pública
- [x] Reconstruir página ServiceTypes.tsx com listagem em tabela (nome, categoria, status, isPublic, setor, formulário, assuntos, publicado)
- [x] Botão "Novo" abre modal/painel com seleção de tipo a criar
- [x] Ações por linha: editar, visualizar, duplicar, publicar/despublicar, desativar
- [x] Aba "Assuntos" dentro de cada tipo de atendimento
- [x] Aba "Formulário" para configurar campos por assunto
- [x] Aba "Publicação" com controle de visibilidade (público/interno/restrito/rascunho)
- [x] Diferenciação visual clara: área interna = tabela, filtros, ações administrativas

### Tela Pública — Central do Cidadão
- [x] Fluxo completo: buscar → categoria → lista de serviços → descrição → solicitar → assunto → formulário → NUP
- [x] Página de descrição do serviço (/servico/:id) com linguagem cidadã
- [x] Descrição do serviço: nome, descrição, finalidade, quem pode solicitar, documentos, prazo, custo, setor, canal
- [x] Botão "Solicitar" na descrição abre o formulário dinâmico
- [x] Formulário dinâmico do cidadão com campos configurados pelo admin
- [x] Seleção de assunto antes do formulário (quando há múltiplos assuntos)
- [x] Upload de documentos obrigatórios/complementares
- [x] Envio gera NUP e exibe confirmação com link de acompanhamento
- [x] Diferenciação visual: área pública = cards, busca, linguagem cidadã, sem menus administrativos
- [x] TypeScript: 0 erros de compilação
- [x] 73 testes passando
