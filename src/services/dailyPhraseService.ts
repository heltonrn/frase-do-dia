import { APP_STATE_KEYS, getAppState, setAppState } from '../database/appStateRepository';
import {
  closeCycle,
  createCycle,
  getOpenCycle,
  getUsedPhraseIdsInCycle,
  recordPhraseUsed,
} from '../database/cycleRepository';
import { getActivePhraseIds, getPhraseById } from '../database/phraseRepository';
import { getTodayLocalDateString } from '../utils/dateUtils';
import {
  DailyPhraseDeps,
  DailyPhraseResult,
  runDailyPhraseEngine,
} from './dailyPhraseEngine';

/**
 * Fiação do motor com a persistência real (SQLite).
 * A lógica de negócio inteira vive em dailyPhraseEngine.ts.
 */
const sqliteDeps: DailyPhraseDeps = {
  getDataUltimaFrase: () => getAppState(APP_STATE_KEYS.dataUltimaFrase),
  getIdFraseDoDia: () => getAppState(APP_STATE_KEYS.idFraseDoDia),
  setFraseDoDia: async (data, fraseId) => {
    await setAppState(APP_STATE_KEYS.dataUltimaFrase, data);
    await setAppState(APP_STATE_KEYS.idFraseDoDia, fraseId);
  },
  getOpenCycle,
  createCycle,
  closeCycle,
  getUsedPhraseIdsInCycle,
  recordPhraseUsed,
  getActivePhraseIds,
  getPhraseById,
};

/** Retorna a frase do dia usando a persistência real do aplicativo. */
export function getDailyPhrase(): Promise<DailyPhraseResult> {
  return runDailyPhraseEngine(sqliteDeps, getTodayLocalDateString(), Math.random);
}
