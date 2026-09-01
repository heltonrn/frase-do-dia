/**
 * Retorna a data local do aparelho no formato YYYY-MM-DD.
 *
 * A regra de "uma frase por dia" (RN01/RN02) usa o dia civil local do
 * usuário, não UTC — quem abre o app às 23h em Brasília deve ganhar
 * frase nova à meia-noite local, não às 21h.
 *
 * O formato ISO por extenso permite comparar datas com comparação de
 * string simples ("2026-08-31" < "2026-09-01").
 */
export function getTodayLocalDateString(agora: Date = new Date()): string {
  const ano = agora.getFullYear();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}
