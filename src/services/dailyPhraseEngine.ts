import { Phrase } from '../types/Phrase';

export type DailyPhraseResult =
  | { status: 'ok'; frase: Phrase }
  | { status: 'sem_frases' };

export interface EngineCycle {
  id: number;
  iniciadoEm: string;
  finalizadoEm: string | null;
}

/**
 * Contrato de persistência exigido pelo motor. A implementação real
 * (SQLite) vive em src/database; testes podem usar versões em memória.
 * O motor não conhece SQLite, React Native nem qualquer biblioteca.
 */
export interface DailyPhraseDeps {
  getDataUltimaFrase(): Promise<string | null>;
  getIdFraseDoDia(): Promise<string | null>;
  setFraseDoDia(data: string, fraseId: string): Promise<void>;
  getOpenCycle(): Promise<EngineCycle | null>;
  createCycle(data: string): Promise<number>;
  closeCycle(cicloId: number, data: string): Promise<void>;
  getUsedPhraseIdsInCycle(cicloId: number): Promise<string[]>;
  recordPhraseUsed(cicloId: number, fraseId: string, data: string): Promise<void>;
  getActivePhraseIds(): Promise<string[]>;
  getPhraseById(id: string): Promise<Phrase | null>;
}

/**
 * Motor da frase do dia. Aplica todas as regras de negócio:
 *
 * - RN01/RN02: se já existe frase registrada para hoje, retorna a mesma
 *   frase sem consumir outra (cenário 2 do MD).
 * - RN05: dias sem uso não consomem frases — a seleção só ocorre quando
 *   o motor roda em uma data ainda sem frase.
 * - RN03: o sorteio considera apenas frases ativas ainda não utilizadas
 *   no ciclo aberto.
 * - RN04 / cenário 4: quando o pool do ciclo esvazia, o ciclo é fechado
 *   e um novo é criado — somente no momento em que uma nova seleção é
 *   necessária. O sorteio aleatório garante ordem independente entre
 *   ciclos.
 * - Cenário 10: sem nenhuma frase ativa, retorna 'sem_frases' de forma
 *   controlada, sem quebrar.
 * - Relógio alterado para trás: se a última frase registrada tem data
 *   futura em relação a hoje, ela continua valendo — o app não sorteia
 *   outra, evitando consumo extra por manipulação de horário.
 */
export async function runDailyPhraseEngine(
  deps: DailyPhraseDeps,
  hoje: string,
  random: () => number,
): Promise<DailyPhraseResult> {
  const dataUltimaFrase = await deps.getDataUltimaFrase();
  const idFraseDoDia = await deps.getIdFraseDoDia();

  const jaTemFraseValida =
    dataUltimaFrase !== null && idFraseDoDia !== null && dataUltimaFrase >= hoje;

  if (jaTemFraseValida) {
    const fraseAtual = await deps.getPhraseById(idFraseDoDia);
    if (fraseAtual) {
      return { status: 'ok', frase: fraseAtual };
    }
    // Registro aponta para frase inexistente (estado inconsistente):
    // segue para uma nova seleção em vez de quebrar.
  }

  const idsAtivos = await deps.getActivePhraseIds();
  if (idsAtivos.length === 0) {
    return { status: 'sem_frases' };
  }

  let ciclo = await deps.getOpenCycle();
  if (!ciclo) {
    const novoCicloId = await deps.createCycle(hoje);
    ciclo = { id: novoCicloId, iniciadoEm: hoje, finalizadoEm: null };
  }

  let disponiveis = await filtrarDisponiveis(deps, ciclo.id, idsAtivos);

  if (disponiveis.length === 0) {
    // Ciclo esgotado: fecha e abre o próximo, agora com o pool completo.
    await deps.closeCycle(ciclo.id, hoje);
    const novoCicloId = await deps.createCycle(hoje);
    ciclo = { id: novoCicloId, iniciadoEm: hoje, finalizadoEm: null };
    disponiveis = idsAtivos;
  }

  const indiceSorteado = Math.floor(random() * disponiveis.length);
  const idSorteado = disponiveis[indiceSorteado];

  const frase = await deps.getPhraseById(idSorteado);
  if (!frase) {
    // Não deveria ocorrer (id veio da própria persistência); falha explícita.
    throw new Error(`Frase sorteada não encontrada: ${idSorteado}`);
  }

  await deps.recordPhraseUsed(ciclo.id, frase.id, hoje);
  await deps.setFraseDoDia(hoje, frase.id);

  return { status: 'ok', frase };
}

async function filtrarDisponiveis(
  deps: DailyPhraseDeps,
  cicloId: number,
  idsAtivos: string[],
): Promise<string[]> {
  const usadas = new Set(await deps.getUsedPhraseIdsInCycle(cicloId));
  return idsAtivos.filter((id) => !usadas.has(id));
}
