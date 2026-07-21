# ADR 0001 — Refatoração da tela de conciliação (frontend)

Status: concluído (aguardando teste em produção)
Data: 2026-07-20

## Contexto

A tela de conciliação estava, na prática, inutilizável para o contador:

1. Ao abrir um lote (`ConciliacaoDetailPage`), **não aparecia nenhum match nem
   movimentação** — só o status e uma lista de arquivos. Não dava para ver os
   matches feitos nem ajustar os errados (ensinar a IA).
2. Os itens de match (extrato × sistema) só existiam numa outra tela
   (`ReconciliationPage`, aba "Pendentes"), desconectada dos cards do lote.
3. O dashboard tinha um card de "Conciliações pendentes" e uma lista de uploads
   ("Atividade recente") que poluíam a visão.
4. Não havia como marcar se um arquivo é **extrato** (banco) ou **sistema**
   (contas a pagar/receber) — sem isso o backend não consegue casar os lados.

## Decisão

- Extrair um componente reutilizável `ReconciliationReview` (resumo + abas
  Pendentes/Histórico + confirmar/rejeitar/manual/agrupar), parametrizado por
  `clienteId` + `competencia`.
- Usá-lo **dentro do detalhe do lote** (filtrando pelo cliente/competência do
  lote), fazendo os matches e movimentações aparecerem onde o contador trabalha.
- Ao enviar arquivo, escolher o **papel do documento** (Extrato × Sistema) e
  mandar `origem` para o backend.
- Simplificar o dashboard (remover card de pendentes e a lista de uploads).

## Tarefas

- [x] F1. Dashboard: remover card "Conciliações pendentes" e a lista de uploads
      ("Atividade recente").
- [x] F2. Componente `ReconciliationReview` (matches + movimentações + ações)
      parametrizado por cliente/competência.
- [x] F3. `ConciliacaoDetailPage`: renderizar `ReconciliationReview` do lote —
      ver e ajustar os matches dentro da conciliação.
- [x] F4. `ReconciliationPage`: reaproveitar `ReconciliationReview`.
- [x] F10. Botão **Otimizar** na aba de pendências (dispara a atribuicao global
      do match para o cliente/competência).
- [x] F9. Nomenclatura mais clara ("Vincular ao sistema" x "Classificar direto") e
      novas abas **Extrato (banco)** e **Sistema (contas a pagar/receber)** listando
      as movimentacoes de cada lado com a situacao (a conciliar/conciliado/classificado).
- [x] F8. Seletor de **banco do extrato** no envio (quando tipo = Extrato), enviando
      `bankAccountId` para a partida dobrada usar a conta contabil do banco certo.
- [x] F7. Lista de pendencias mais compacta + seletor de itens por pagina
      (10/25/50/100) + paginacao com numero de pagina.
- [x] F6. Polling nos itens/resumo de conciliacao + invalidacao ao anexar arquivo:
      as movimentacoes aparecem sozinhas apos o processamento assincrono, sem
      precisar sair e voltar da tela.
- [x] F5. Seletor de papel do documento (Extrato × Sistema) no upload do lote;
      enviar `origem`. Exibir `origem` na lista de arquivos.

## Consequências

- O contador vê e ajusta os matches dentro do próprio lote de conciliação.
- Cada correção alimenta o aprendizado da IA no backend (confirmação → conta).
- Dashboard mais limpo, focado na carteira.
