s# LedgerFlow — Frontend: tasks de implementação (React + TypeScript)

Este documento é para a IA implementar. Cobre **todas as telas do sistema completo**,
organizadas para acompanhar os épicos do documento de backend. Cada épico tem: telas,
componentes, estados de UI e uma lista de tasks numeradas.

**Stack fixa:** React + TypeScript (Vite), MUI, TanStack Query (dados remotos),
React Router, React Hook Form + Zod (formulários e validação), Axios.

**Padrão obrigatório de pastas:**
```
frontend/src/
  modules/<modulo>/
    pages/
    components/
    hooks/        (TanStack Query: useXxxQuery, useXxxMutation)
    types.ts
    api.ts        (chamadas Axios, tipadas com os DTOs do backend)
  shared/
    components/   (layout, tabela genérica, upload genérico, etc.)
    hooks/
    lib/
```

**Estados obrigatórios em toda tela que busca dados:** loading (skeleton, não spinner
genérico), vazio (mensagem + ação, nunca tela em branco), erro (mensagem + tentar
novamente), sucesso.

---

## E0 — Fundação do frontend

**Tasks:**
1. Criar projeto Vite + React + TypeScript.
2. Instalar e configurar MUI (tema base: cores neutras, tipografia).
3. Configurar TanStack Query (QueryClientProvider, defaults de `staleTime`/retry).
4. Configurar React Router (rotas públicas: login/recuperação; rotas privadas: tudo
   dentro de um `AppLayout` com sidebar + navbar).
5. Configurar Axios com interceptor de JWT (anexa token, trata 401 disparando refresh
   ou redirecionando para login).
6. Componente `AppLayout`: sidebar com os módulos (Dashboard, Clientes, Uploads,
   Conciliação, Plano de contas, Exportação, Financeiro, Agenda, Configurações),
   navbar com nome do usuário/empresa e logout.
7. Componente genérico `DataTable` (paginação, ordenação, filtro) reutilizável por
   todos os módulos.
8. Componente genérico `FileDropzone` (drag-and-drop, múltiplos arquivos, progresso).
9. Tratamento global de erro (toast/snackbar do MUI) conectado ao interceptor do Axios.

---

## E1 — Auth & Usuários

**Telas:** Login, Recuperação de senha, Redefinição de senha, Meu perfil, Lista/CRUD
de usuários (visível só para ADMIN).

**Tasks:**
1. Página de login (e-mail + senha, validação com Zod, mensagem de erro clara sem
   detalhe técnico exposto).
2. Fluxo de recuperação de senha (2 telas: pedir e-mail → redefinir com token da URL).
3. Página "meu perfil" (dados básicos, trocar senha).
4. Tela de gestão de usuários (tabela + modal de criar/editar, seleção de perfil).
5. Guard de rota por perfil (`RequireRole`) reutilizável em todas as rotas privadas.
6. Hooks: `useLogin`, `useForgotPassword`, `useResetPassword`, `useUsersQuery`,
   `useCreateUserMutation`, `useUpdateUserMutation`.

---

## E2 — Empresas

**Telas:** Cadastro/edição da empresa (dados fiscais, logo, plano), tela de
configurações gerais.

**Tasks:**
1. Formulário de empresa com máscara de CNPJ e validação.
2. Upload de logo reaproveitando `FileDropzone`.
3. Hooks: `useCompanyQuery`, `useUpdateCompanyMutation`.

---

## E3 — Clientes

**Telas:** Lista de clientes (busca, filtro por status), cadastro/edição de cliente,
detalhe do cliente (dados + documentos vinculados).

**Tasks:**
1. `DataTable` de clientes com busca por nome/CNPJ.
2. Formulário de cadastro/edição (modal ou página dedicada).
3. Aba de documentos dentro do detalhe do cliente (lista de arquivos vinculados,
   reaproveitando componentes de E4).
4. Hooks: `useClientsQuery`, `useClientQuery`, `useCreateClientMutation`,
   `useUpdateClientMutation`.

---

## E4 — Upload de arquivos

**Tela:** Upload (dropzone + fila com status em tempo real/polling).

**Componentes:**
- `FileDropzone` (aceita PDF, CSV, XLSX, OFX, XML, TXT, ZIP, imagens).
- `UploadQueueList` (cada item com nome, tipo, status — recebido/processando/
  concluído/erro — e ação de remover ou ver detalhe).

**Tasks:**
1. Tela de upload com dropzone no topo e fila abaixo.
2. Polling (ou refetch a cada N segundos via TanStack Query) para atualizar status dos
   itens em processamento.
3. Estado de erro por item (ex: "arquivo excede tamanho máximo", "tipo não suportado")
   exibido inline, sem travar o restante da fila.
4. Hooks: `useUploadFileMutation`, `useUploadsQuery` (com polling), `useDeleteUploadMutation`.

---

## E5/E6/E7 — Acompanhamento do pipeline (OCR → Parser → Normalização)

**Tela:** Detalhe do processamento (acessível a partir de um item da fila de upload).

**Componentes:**
- `PipelineStepper` (visual de etapas: Upload → OCR → Parser → Normalização →
  Conciliação, cada uma com estado concluído/em andamento/pendente/erro).
- `ProcessingLog` (lista de eventos tipo log, com timestamp).

**Tasks:**
1. Tela de detalhe do processamento com o `PipelineStepper` no topo.
2. Lista de log abaixo, atualizada por polling enquanto o status não for final.
3. Ação de "tentar novamente" quando uma etapa falhar.
4. Hooks: `useUploadDetailQuery` (com polling condicional — só enquanto não concluído).

---

## E8 — Conciliação bancária

**Tela:** Conciliação (visão lado a lado extrato x planilha/sistema).

**Componentes:**
- `ReconciliationSplitView` (duas colunas + indicador central de match).
- `MatchStatusBadge` (confirmado / sugerido / pendente).
- `ManualMatchModal` (busca e associa manualmente quando não há sugestão).

**Tasks:**
1. Tela de conciliação puxando pendências (`GET /reconciliations/pending`).
2. Ação de confirmar sugestão individualmente e em lote.
3. Modal de revisão manual para pendências sem sugestão.
4. Aba/filtro de histórico de conciliações já confirmadas.
5. Hooks: `usePendingReconciliationsQuery`, `useConfirmReconciliationMutation`,
   `useRejectReconciliationMutation`, `useReconciliationHistoryQuery`.

---

## E9 — Plano de contas & classificação

**Telas:** Plano de contas (cadastro/hierarquia de contas), Classificação de
movimentações (tabela com sugestão + confiança + ação), Motor de regras (lista e
formulário de regras configuráveis).

**Tasks:**
1. `DataTable` de plano de contas com estrutura hierárquica (árvore ou indentação).
2. Tela de classificação: tabela com colunas descrição / conta sugerida / confiança /
   ação (confirmar, corrigir via select de conta).
3. Indicador visual de confiança (ex: badge verde ≥80%, amarelo 40-79%, vermelho <40%).
4. Tela do motor de regras: lista de regras existentes + formulário para criar regra
   (condição: campo, operador, valor → ação: categoria).
5. Hooks: `useChartOfAccountsQuery`, `useMovementSuggestionsQuery`,
   `useClassifyMovementMutation`, `useAccountRulesQuery`, `useCreateAccountRuleMutation`.

---

## E10 — Exportação / layouts

**Tela:** Exportação (cards por sistema contábil + histórico).

**Componentes:**
- `LayoutExportCard` (ícone, nome do sistema, botão exportar/configurar).
- Modal de seleção de período/movimentações antes de gerar a exportação.

**Tasks:**
1. Tela com grid de cards (Domínio, Alterdata, SCI, Questor, Layout customizado).
2. Modal de configuração antes de exportar (período, cliente, filtro de status
   conciliado/classificado).
3. Lista de histórico de exportações com link de download do arquivo gerado.
4. Hooks: `useLayoutsQuery`, `useExportLayoutMutation`, `useExportHistoryQuery`.

---

## E11 — Dashboard

**Tela:** Dashboard (tela inicial após login).

**Componentes:**
- `MetricCard` (pendências, uploads do dia, conciliações, erros).
- `RecentActivityList`.

**Tasks:**
1. Grid de `MetricCard` consumindo `GET /dashboard/summary`.
2. Lista de atividade recente consumindo `GET /dashboard/activity`.
3. Estado vazio amigável quando não houver nenhuma atividade ainda (primeira vez que
   o usuário acessa).
4. Hooks: `useDashboardSummaryQuery`, `useDashboardActivityQuery`.

---

## E12 — Financeiro do escritório (com boleto/PIX real)

**Telas:** Honorários (CRUD por cliente), Cobranças (lista com status, agora com dados
reais de boleto/PIX vindos do gateway), Detalhe da cobrança (boleto + QR code do PIX),
Inadimplência.

**Componentes:**
- `InvoiceStatusBadge` (pendente / pago / atrasado / cancelado).
- `PixQrCodeCard` (mostra o QR code e o código copia-e-cola, com botão de copiar).
- `BoletoLinkButton` (abre/baixa o PDF do boleto retornado pelo gateway).

**Tasks:**
1. Tela de honorários com `DataTable` + formulário de valor/periodicidade por cliente.
2. Tela de cobranças com filtro por status; cada linha mostra o `InvoiceStatusBadge`
   com o status real vindo do gateway (atualizado via webhook no backend).
3. Tela de detalhe da cobrança exibindo `PixQrCodeCard` e `BoletoLinkButton` quando
   disponíveis, e o histórico de tentativas/atualizações de status.
4. Painel de inadimplência (lista + destaque visual de clientes em atraso).
5. Hooks: `useOfficeFeesQuery`, `useOfficeInvoicesQuery`, `useInvoiceDetailQuery`
   (com polling curto enquanto o status estiver pendente), `useOverdueReceivablesQuery`.

---

## E13 — Agenda fiscal

**Tela:** Agenda (calendário ou lista de obrigações por vencimento).

**Tasks:**
1. Lista/calendário de obrigações fiscais com vencimento e cliente vinculado.
2. Filtro por período e por cliente.
3. Indicador visual de "vence em breve" / "vencido".
4. Hooks: `useFiscalObligationsQuery`, `useUpcomingObligationsQuery`.

---

## E14 — Notificações

**Componente:** `NotificationBell` no navbar (contagem + lista dropdown).

**Tasks:**
1. Ícone de notificações no navbar com contador de não lidas.
2. Dropdown/painel lateral com lista de notificações e ação de marcar como lida.
3. Hook: `useNotificationsQuery` (polling leve).

---

## E15 — Auditoria

**Tela:** Auditoria (visível só para ADMIN) — tabela de logs com filtro por usuário,
entidade e período.

**Tasks:**
1. `DataTable` de logs com filtros.
2. Detalhe expandido do log (payload em JSON formatado, de forma legível).
3. Hook: `useAuditLogsQuery`.

---

## E16 — Portal do cliente (fase posterior ao MVP)

**Telas:** versão simplificada para o perfil CLIENTE — upload de arquivos e
acompanhamento de status, sem acesso ao restante do sistema.

**Tasks:**
1. Layout alternativo mais simples para o perfil CLIENTE (esconder sidebar completa,
   mostrar só upload + status).
2. Reaproveitar `FileDropzone` e `PipelineStepper` das telas internas.
3. Guard de rota garantindo que CLIENTE só acessa essas telas.

---

## E17 — Integrações & Webhooks (configuração para n8n)

**Telas:** Configurações → Webhooks (lista, criar/editar assinatura, log de entregas),
Configurações → Chaves de API (lista, criar com exibição única da chave, revogar).

**Componentes:**
- `WebhookSubscriptionForm` (selecionar evento de uma lista fixa — ver catálogo no
  documento de backend —, informar a URL de destino do n8n, gerar/mostrar o segredo).
- `WebhookDeliveryLog` (tabela com data, evento, status HTTP, sucesso/falha, botão de
  "ver payload enviado").
- `ApiKeyCreatedModal` (mostra a chave gerada uma única vez, com aviso de que não será
  exibida de novo, e botão de copiar).

**Tasks:**
1. Tela de webhooks: lista de assinaturas ativas, botão de criar nova (seleciona o
   evento num dropdown com os tipos do catálogo, cola a URL do webhook do n8n).
2. Botão "testar" em cada assinatura, disparando o endpoint de teste do backend e
   mostrando o resultado (sucesso/falha) imediatamente.
3. Aba de log de entregas por assinatura, para depurar quando o n8n não estiver
   recebendo o evento esperado.
4. Tela de chaves de API: lista com nome/escopo/último uso, criação com escolha de
   escopo, exibição única da chave gerada, ação de revogar.
5. Hooks: `useWebhookSubscriptionsQuery`, `useCreateWebhookSubscriptionMutation`,
   `useTestWebhookMutation`, `useWebhookDeliveriesQuery`, `useApiKeysQuery`,
   `useCreateApiKeyMutation`, `useRevokeApiKeyMutation`.

---

## Ordem recomendada de execução

Acompanha o backend: `E0 → E1 → E2 → E3 → E4 → (E5/E6/E7) → E8 → E9 → E10 → E11`,
depois `E12, E13, E14, E15` em paralelo. Vale adiantar o `E17` (webhooks/API keys)
logo após `E12`/`E13` — é o que libera automatizar o resto via n8n sem esperar o MVP
inteiro. `E16` fica para depois do MVP validado.
Cada tela só deve ser implementada depois que o endpoint correspondente do backend
estiver disponível (ou ao menos com contrato de API definido/mockado).
