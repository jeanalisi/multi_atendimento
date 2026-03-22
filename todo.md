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

## Fase 21: Novo Atendimento com Identificadores Obrigatórios de Contato [CONCLUÍDO]

### Regras de Negócio
- [x] Ao menos UM dos identificadores obrigatórios deve ser informado: e-mail, telefone ou conta do Instagram
- [x] CPF e CNPJ são opcionais e complementares — nunca substituem o identificador principal
- [x] CPF/CNPJ só podem ser informados se houver ao menos um identificador principal
- [x] O canal da conversa deve ser coerente com o identificador utilizado na abertura
- [x] Telefone → WhatsApp/SMS; E-mail → E-mail; Instagram → Instagram

### Backend
- [x] Tabela nupNotifications criada (nup, entityType, channel, status, sentAt, content, trackingLink, contactId)
- [x] Procedure: contacts.findOrCreate (busca por email/phone/igHandle, cria se não existir)
- [x] Procedure: contacts.list (busca de contatos com filtros)
- [x] Validação: rejeitar abertura de conversa sem ao menos um identificador principal
- [x] Validação: canal compatível com o identificador utilizado

### Frontend
- [x] Modal "Novo Atendimento" com campos: E-mail, Telefone, Instagram (ao menos 1 obrigatório)
- [x] Campos opcionais: CPF/CNPJ
- [x] Validação em tempo real: ao menos um identificador principal preenchido
- [x] Seleção automática do canal baseada no identificador informado
- [x] Botão "Novo Atendimento" no Inbox

## Fase 22: Notificação Automática ao Gerar NUP [CONCLUÍDO]

### Regras de Negócio
- [x] Toda geração de NUP dispara notificação automática ao usuário/cidadão
- [x] Canal da notificação = canal de origem do contato
- [x] Mensagem contém: confirmação, NUP, assunto/tipo, link de acompanhamento, próximos passos
- [x] Link de acompanhamento é seguro (token HMAC-SHA256)
- [x] Envio registrado em log (data, canal, status, conteúdo, link)

### Backend
- [x] Tabela: nupNotifications (nup, entityType, entityId, channel, status, sentAt, content, trackingLink, contactId)
- [x] Helper: generateTrackingToken(nup, contactId) — gera token HMAC-SHA256
- [x] Helper: generateTrackingLink(nup, token) — gera link /consulta?nup=NUP&token=TOKEN
- [x] Procedure: nup.sendNotification (identifica canal, envia, registra log)
- [x] Procedure: nup.getNotifications (listar logs por NUP)
- [x] Integração com sendEmail para canal e-mail
- [x] Trigger automático: ao criar protocolo (protocols.create), chama sendNupNotification
- [x] Trigger automático: ao criar solicitação pública (cidadao.submitRequest), chama sendNupNotification

### Frontend
- [x] Botão "Novo Atendimento" no Inbox com modal completo
- [x] TypeScript: 0 erros de compilação
- [x] 73 testes passando

## Fase 23: Correções Urgentes [CONCLUÍDO]

- [x] Modal Novo Atendimento: corrigir query de contas conectadas — campo `channel` (não `type`) e `status` (não `isActive`), com auto-select quando há apenas uma conta
- [x] Tela de login: redirecionamento automático investigado — o sistema não tem redirect automático; o fluxo OAuth redireciona para `/` após login (comportamento correto)
- [x] Gestão Pública: corrigir erro `Select.Item value=""` — todos os filtros e modais corrigidos (Protocolos, Processos, Documentos, Ouvidoria, Modelos, ServicoDetalhe, Sectors, ProtocolDetail)
- [x] 73 testes passando, TypeScript 0 erros

## Fase 24: Alteração do Prefixo NUP [CONCLUÍDO]
- [x] Alterar prefixo do NUP de "CAIUS" para "PMI" na função `generateNup()` em `server/db-caius.ts`
- [x] Atualizar placeholder e texto de exemplo na página de Consulta Pública (PublicConsulta.tsx)
- [x] Novos protocolos gerados com formato PMI-AAAA-NNNNNN (ex: PMI-2026-000001)
- [x] 73 testes passando, TypeScript 0 erros

## Fase 25: Tramitação Pública e Dados de Contato da Central do Cidadão [CONCLUÍDO]

### Backend
- [x] Procedure pública: caius.public.getTramitations(nup) — retorna tramitações com setores, ação e despacho
- [x] Campos de contato reutilizam institutionalConfig com prefixo contact_*

### Frontend — Consulta Pública
- [x] Linha do tempo de tramitação na página de resultado do NUP (componente TramitationTimeline)
- [x] Exibe: data, setor de origem, setor de destino, ação com ícone colorido, despacho
- [x] Tramitações sigilosas não são retornadas pela API pública

### Frontend — Central do Cidadão
- [x] Dados de contato dinâmicos (telefone, email, endereço, horário) na Central do Cidadão
- [x] Aba "Contato" em Configurações Institucionais com campos: telefone, WhatsApp, e-mail, endereço, horários, site, redes sociais, nome no rodapé, ano do copyright
- [x] Preview em tempo real da barra institucional com os dados configurados
- [x] Barra superior, canais de atendimento e rodapé da Central do Cidadão usam dados dinâmicos
- [x] 73 testes passando, TypeScript 0 erros

## Fase 26: Despacho de Tramitação — Anexos e Editor Avançado [CONCLUÍDO]

### Backend
- [x] Reutiliza attachments.upload e attachments.getByEntity com entityType="tramitation"
- [x] createTramitation retorna tramitationId para vinculação de anexos
- [x] Procedure create de tramitações retorna { success, tramitationId }

### Frontend — Modal de Despacho
- [x] TipTap instalado (@tiptap/react, starter-kit, underline, link, text-align, placeholder)
- [x] Componente RichTextEditor criado com toolbar completa (negrito, itálico, sublinhado, títulos, listas, citação, alinhamento, link, desfazer/refazer)
- [x] Modal de despacho usa RichTextEditor em vez de Textarea
- [x] Upload de documentos com drop zone (PDF, Word, imagens, planilhas, até 20MB)
- [x] Lista de arquivos pendentes com nome, tamanho e botão remover
- [x] Validação: máximo 5 arquivos, 20MB por arquivo
- [x] Upload dos anexos após criação da tramitação usando tramitationId

### Frontend — Visualização
- [x] TramitationItem exibe despacho como HTML renderizado (dangerouslySetInnerHTML)
- [x] Botão "Ver anexos" carrega e exibe lista de arquivos por tramitação
- [x] Anexos são links diretos para S3 (abre em nova aba)
- [x] Consulta Pública também renderiza despacho como HTML
- [x] 73 testes passando, TypeScript 0 erros

## Bug: Link de Convite 404 [CORRIGIDO]
- [x] Criada página AcceptInvite.tsx com exibição dos detalhes do convite (unidade, perfil, validade)
- [x] Adicionada rota /convite/:token no App.tsx (pública, sem autenticação)
- [x] Formulário de aceite com confirmação de nome, tratamento de erros (expirado, cancelado, já aceito)
- [x] Após aceite, exibe tela de sucesso com botão para acessar o sistema
- [x] TypeScript 0 erros, 73 testes passando

## Fase 27: Editor Rich Text e Anexos em Todos os Módulos de Gestão Pública

- [x] Protocolos: campo "Descrição" no modal de criação → RichTextEditor + upload de documentos
- [x] Processos Administrativos: campo "Descrição" no modal de criação → RichTextEditor + upload
- [x] Documentos Oficiais: campo "Conteúdo/Ementa" no modal de criação → RichTextEditor + upload
- [x] Ouvidoria: campo "Descrição" no modal de criação → RichTextEditor + upload
- [x] Modelos de Documentos: campo "Conteúdo" no modal de criação/edição → RichTextEditor
- [x] Visualização: renderizar HTML no campo descrição do ProtocolDetail (dangerouslySetInnerHTML)
- [x] Backend: createProtocol retorna protocolId para vinculação de anexos
- [x] TypeScript 0 erros, 73 testes passando

## Fase 28: E-mails, Editor Word, Tipos de Processos Dinâmicos, Adicionar Usuários [CONCLUÍDO]

- [x] NUP automático para Documentos Oficiais — já estava implementado (createOfficialDocument chama generateNup())
- [x] Corrigir envio de e-mails (SMTP/IMAP) — TLS flexível, rejectUnauthorized false, melhor diagnóstico de erros
- [x] Criar DocumentEditor estilo Word (TipTap avançado) com toolbar completa, área de folha centralizada, exportar PDF, imprimir, modo edição/visualização
- [x] Substituir RichTextEditor pelo DocumentEditor em todos os módulos de Gestão Pública
- [x] Criar tipos de processos dinâmicos (CRUD) — tabela customModules + router + páginas CustomModules e CustomModuleRecords + menu dinâmico no DashboardLayout
- [x] Adicionar funcionalidade de convidar/criar usuários na página Usuários e Agentes — modal com e-mail, nome, unidade, cargo, perfil, validade, link gerado
- [x] Corrigir georreferenciamento — campo GeoField no formulário dinâmico com GPS + endereço via Nominatim
- [x] Captura de selfie dentro do sistema — campo SelfieField com câmera ao vivo e captura de foto
- [x] 73 testes passando, TypeScript 0 erros

## Fase 29: Autenticação de Documentos — Chave, QR Code, Chancela e Assinatura Eletrônica [CONCLUÍDO]

### Banco de Dados
- [x] Tabela: verifiableDocuments (documentos verificáveis com chave, hash, QR Code, status, versão)
- [x] Tabela: documentSignatures (assinaturas eletrônicas por documento: signatário, tipo, hash, IP, status)
- [x] Tabela: documentVerificationLogs (logs de acesso à verificação pública)

### Backend
- [x] Procedure: verification.issue — emitir documento verificável com chave e QR Code
- [x] Procedure: verification.verify — verificar autenticidade por NUP ou chave (pública)
- [x] Procedure: verification.sign — assinar documento (institucional/avançada/qualificada)
- [x] Procedure: verification.getByEntity — listar signatários de um documento
- [x] Procedure: verification.revokeSignature — revogar assinatura
- [x] Procedure: verification.invalidate — invalidar documento
- [x] Procedure: verification.list — listar documentos verificáveis

### Frontend — Componentes
- [x] Componente: DocumentChancela — chancela visual com QR Code, chave, NUP, signatários, status
- [x] Componente: DocumentSignaturesPanel — painel de assinaturas com modal de assinatura (3 níveis)

### Frontend — Páginas Internas
- [x] Modal de assinatura de documento (selecionar tipo: institucional/avançada/qualificada)
- [x] Página: DocumentSignatures.tsx — módulo interno de assinaturas com múltiplos signatários

### Frontend — Central do Cidadão
- [x] Página pública: /verificar/:key — verificação de autenticidade por chave ou NUP
- [x] Exibe: status (autêntico/inválido/cancelado/substituído), tipo, signatários, data, órgão emissor
- [x] Acesso direto por QR Code (rota pública sem autenticação)
- [x] 73 testes passando, TypeScript 0 erros

## Fase 30: Arquitetura Omnichannel — ChannelGateway, Workers e Notificação por Canal de Origem

### Banco de Dados
- [x] Tabela: channelSyncState (estado de sincronização por conta/canal)
- [x] Tabela: messageEvents (eventos de mensagem por canal)
- [x] Tabela: channelHealthLogs (logs de saúde dos conectores)

### Backend — Módulos
- [x] ChannelGateway (server/channel-gateway.ts) — abstração central com interface connect/disconnect/healthCheck/pullMessages/sendMessage/sendAttachment/markAsRead/resolveIdentity
- [x] WhatsAppConnector — conector com healthCheck via status da conta
- [x] InstagramConnector — conector OAuth com pullMessages via Graph API e sendMessage
- [x] EmailConnector — conector IMAP/SMTP com healthCheck e sendMessage
- [x] Router: omnichannel (server/routers-omnichannel.ts) — health.all, health.history, health.check, health.dashboard, sync.getState, sync.listAll, events.recent, send.message, connectors.list, connectors.reinit, connectors.register, connectors.unregister

### Frontend
- [x] Página: ChannelHealth (/channel-health) — dashboard de saúde com KPIs, status por canal, tabela de contas, histórico de logs
- [x] Menu lateral: item "Saúde dos Canais" no grupo Atendimento
- [x] Modal Novo Atendimento: indicador de status (verde/amarelo) nas contas do select

### Testes
- [x] 73 testes passando, TypeScript 0 erros

## Fase 31: Evolução Completa CAIUS — Especificação 40-A

### Banco de Dados — Novos Módulos
- [x] Tabelas: workflowDefinitions, workflowSteps, workflowStepRules, workflowTransitions
- [x] Tabelas: workflowInstances, workflowInstanceSteps, workflowDeadlines, workflowEvents
- [x] Tabelas: documentVersions, documentReadLogs, documentNumberSequences
- [x] Tabelas: manifestationTypes, manifestationStatusHistory, manifestationDeadlines, manifestationResponses
- [x] Tabelas: geoPoints, geoEvents, geoAttachments
- [x] Tabelas: knowledgeArticles, knowledgeCategories
- [x] Tabelas: agentStatus, conversationTransfers, quickReplies, attendanceMetricsSnapshots
- [x] Tabelas: ombudsmanManifestations e relacionadas (28 novas tabelas no total)

### Backend — Motor de Workflow Visual
- [x] Router: workflow.definitions (CRUD definições, etapas, regras, transições)
- [x] Router: workflow.instances (iniciar, avançar etapa, encerrar, histórico)
- [x] workflow.sla (checkOverdue, listOverdue, resolve)
- [x] Vínculo workflow ↔ serviceType

### Backend — Gestão Documental Avançada
- [x] Router: documents (versions, numberSequences, readLogs) em routers-documents.ts

### Backend — Dashboard Executivo
- [x] Router: publicServices.dashboard (kpis, byChannel, bySector, timeSeries, overdueProtocols)

### Backend — Ouvidoria / e-SIC
- [x] Router: publicServices.ouvidoria (types, list, get, create, updateStatus, respond, publicTrack)

### Backend — Georreferenciamento
- [x] Router: publicServices.geo (points.list, points.create, events.list, events.get, events.create, events.updateStatus, mapData)

### Backend — Base de Conhecimento
- [x] Router: publicServices.knowledge (categories.list, categories.upsert, articles.list, articles.publicList, articles.get, articles.upsert, articles.markHelpful)

### Backend — Atendimento Humano Avançado
- [x] Router: publicServices.agentStatus (get, update, listOnline)
- [x] Router: publicServices.transfers (create, accept, reject)
- [x] Router: publicServices.quickReplies (list, upsert, delete, recordUsage)
- [x] Router: publicServices.metrics (snapshot, listByAgent)

### Frontend — Central do Cidadão Fortalecida
- [x] Abas Ouvidoria e Acompanhar adicionadas na CentralCidadao.tsx
- [x] Formulário de manifestação pública (tipo, assunto, descrição, anonimato, sigilo)
- [x] Acompanhamento de manifestação por NUP (busca pública sem login)

### Frontend — Área Interna
- [x] Página: WorkflowDesigner (/workflow) — CRUD de workflows com canvas visual
- [x] Página: ExecutiveDashboard (/executive-dashboard) — KPIs globais, gráficos por canal/setor, séries temporais
- [x] Página: OuvidoriaAdmin (/ouvidoria-admin) — listagem, filtros, detalhe, resposta, prazo
- [x] Página: GeoMonitor (/geo-monitor) — mapa de ocorrências com filtros territoriais
- [x] Página: KnowledgeBase (/knowledge-base) — artigos, categorias, busca, editor
- [x] Menu lateral: 4 novos itens no grupo Gestão Pública (Workflows, Dashboard Executivo, Geo Monitor, Base de Conhecimento)

### Testes
- [x] 73 testes passando, TypeScript 0 erros

## Fase 32: Assinaturas Digitais, Chancela e Exportação PDF

### Assinaturas Digitais e Verificação de Autenticidade
- [x] Rota /document-signatures e item de menu "Assinaturas Digitais" no grupo Gestão Pública
- [x] Rota /assinaturas/:entityType/:entityId para acesso direto por entidade
- [x] Botão "Chancela" na lista de Documentos Oficiais (Documents.tsx)
- [x] Componente ProtocolPrintButton com layout institucional completo (NUP, dados, tramitações, assinaturas, chancela, QR Code dinâmico via CDN)
- [x] Botão "Exportar PDF" no cabeçalho da página ProtocolDetail
- [x] Aba "Verificar Documento" na Central do Cidadão (busca por chave, exibe dados, assinaturas)
- [x] Página pública /verificar/:key com resultado completo de autenticação

### Testes
- [x] 73 testes passando, TypeScript 0 erros
