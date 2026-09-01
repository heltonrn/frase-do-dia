import { DailyPhraseDeps, EngineCycle } from '../src/services/dailyPhraseEngine';
import { Phrase } from '../src/types/Phrase';

/** Frase de teste com valores padrão. */
export function frase(id: string): Phrase {
  return { id, texto: `Texto ${id}`, autor: 'Autor desconhecido', categoria: 'Vida', ativo: true };
}

export interface Fakes {
  deps: DailyPhraseDeps;
  ciclos: EngineCycle[];
  usos: Array<{ cicloId: number; fraseId: string; data: string }>;
}

/** Persistência em memória que implementa o contrato do motor. */
export function criarFakes(frases: Phrase[]): Fakes {
  const estado = new Map<string, string>();
  const ciclos: EngineCycle[] = [];
  const usos: Array<{ cicloId: number; fraseId: string; data: string }> = [];
  let proximoCicloId = 1;

  const deps: DailyPhraseDeps = {
    getDataUltimaFrase: async () => estado.get('data') ?? null,
    getIdFraseDoDia: async () => estado.get('id') ?? null,
    setFraseDoDia: async (data, id) => {
      estado.set('data', data);
      estado.set('id', id);
    },
    getOpenCycle: async () => [...ciclos].reverse().find((c) => c.finalizadoEm === null) ?? null,
    createCycle: async (data) => {
      const id = proximoCicloId;
      proximoCicloId += 1;
      ciclos.push({ id, iniciadoEm: data, finalizadoEm: null });
      return id;
    },
    closeCycle: async (cicloId, data) => {
      const ciclo = ciclos.find((c) => c.id === cicloId);
      if (ciclo) {
        ciclo.finalizadoEm = data;
      }
    },
    getUsedPhraseIdsInCycle: async (cicloId) =>
      usos.filter((u) => u.cicloId === cicloId).map((u) => u.fraseId),
    recordPhraseUsed: async (cicloId, fraseId, data) => {
      usos.push({ cicloId, fraseId, data });
    },
    getActivePhraseIds: async () => frases.filter((f) => f.ativo).map((f) => f.id),
    getPhraseById: async (id) => frases.find((f) => f.id === id) ?? null,
  };

  return { deps, ciclos, usos };
}
