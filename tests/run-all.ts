/**
 * Suíte de testes das camadas puras do aplicativo (rodar com: npm test).
 *
 * Cobre tudo que não depende de SQLite/React Native: validação da base,
 * diff de sincronização, motor da frase do dia (cenários 1-7 e 10 do
 * documento de requisitos + casos extras), formatação de
 * compartilhamento e parse de horário. O que depende de plataforma
 * (SQLite real, folha de compartilhamento, notificações, banner) está
 * no roteiro manual em TESTES.md.
 */
import { runDailyPhraseEngine } from '../src/services/dailyPhraseEngine';
import { Phrase, PhraseBasePackage } from '../src/types/Phrase';
import { getTodayLocalDateString } from '../src/utils/dateUtils';
import { diffPhraseBase } from '../src/utils/diffPhraseBase';
import { ASSINATURA_APP, formatPhraseForSharing } from '../src/utils/formatPhraseForSharing';
import { parseHorario } from '../src/utils/parseHorario';
import {
  buildFeedbackMailtoUrl,
  getReviewStateAfterAnswer,
  parseStoredTimestamp,
  REVIEW_FEEDBACK_COOLDOWN_DAYS,
  REVIEW_FEEDBACK_EMAIL,
  REVIEW_SNOOZE_DAYS,
  ReviewEligibilityInput,
  shouldPromptReview,
} from '../src/services/reviewPolicy';
import { validatePhraseBase } from '../src/utils/validatePhraseBase';
import { phrasesPackageV1 } from '../src/database/phrasesData';
import { criarFakes, frase } from './fakes';

let total = 0;
function ok(cond: boolean, msg: string): void {
  total += 1;
  if (!cond) {
    throw new Error(`FALHOU: ${msg}`);
  }
  console.log(`OK: ${msg}`);
}

async function testesBaseDeFrases(): Promise<void> {
  const resultado = validatePhraseBase(phrasesPackageV1);
  ok(resultado.valido, `base v1 válida (${phrasesPackageV1.frases.length} frases, sem duplicadas/campos vazios)`);

  const comDuplicada = {
    versaoBase: 1,
    frases: [frase('a'), { ...frase('b'), texto: frase('a').texto.toUpperCase() }],
  };
  ok(!validatePhraseBase(comDuplicada).valido, 'validador detecta quase-duplicada (mesmo texto, caixa diferente)');
}

function testesDiff(): void {
  const d1 = diffPhraseBase(phrasesPackageV1, new Set(), new Map());
  ok(d1.novas.length === phrasesPackageV1.frases.length, 'diff: primeira instalação insere a base inteira');

  const v2: PhraseBasePackage = {
    versaoBase: 2,
    frases: [
      ...phrasesPackageV1.frases.map((f) => (f.id === 'frase-030' ? { ...f, ativo: false } : f)),
      { ...frase('frase-999'), categoria: 'Vida' },
    ],
  };
  const ids = new Set(phrasesPackageV1.frases.map((f) => f.id));
  const ativos = new Map(phrasesPackageV1.frases.map((f) => [f.id, f.ativo]));
  const d2 = diffPhraseBase(v2, ids, ativos);
  ok(d2.novas.length === 1 && d2.novas[0].id === 'frase-999', 'diff: atualização insere só os ids novos');
  ok(d2.ativoAlterado.length === 1 && d2.ativoAlterado[0].id === 'frase-030' && !d2.ativoAlterado[0].ativo, 'diff: desativação detectada sem tocar nas demais');

  const d3 = diffPhraseBase(phrasesPackageV1, ids, ativos);
  ok(d3.novas.length === 0 && d3.ativoAlterado.length === 0, 'diff: reabertura sem mudanças não gera operações');
}

async function testesMotor(): Promise<void> {
  const rnd = Math.random;
  const { deps, ciclos } = criarFakes([frase('a'), frase('b'), frase('c')]);

  const r1 = await runDailyPhraseEngine(deps, '2026-08-01', rnd);
  ok(r1.status === 'ok', 'cenário 1: primeiro acesso sorteia uma frase');
  const dia1 = r1.status === 'ok' ? r1.frase.id : '';

  const r2 = await runDailyPhraseEngine(deps, '2026-08-01', rnd);
  ok(r2.status === 'ok' && r2.frase.id === dia1, 'cenário 2: mesma frase no mesmo dia');

  const r3 = await runDailyPhraseEngine(deps, '2026-08-02', rnd);
  ok(r3.status === 'ok' && r3.frase.id !== dia1, 'cenário 3: dia novo, frase diferente');

  const r4 = await runDailyPhraseEngine(deps, '2026-08-20', rnd);
  ok(r4.status === 'ok', 'cenário 6: volta após 18 dias ausente e recebe exatamente 1 frase');

  const r5 = await runDailyPhraseEngine(deps, '2026-08-21', rnd);
  ok(r5.status === 'ok', 'cenário 5: base esgotada abre novo ciclo e volta a sortear');
  ok(ciclos.length === 2 && ciclos[0].finalizadoEm === '2026-08-21', 'cenário 4: ciclo fechado/criado somente na nova seleção');

  const r6 = await runDailyPhraseEngine(deps, '2026-08-15', rnd);
  ok(r6.status === 'ok' && r5.status === 'ok' && r6.frase.id === r5.frase.id, 'relógio atrasado: mantém a frase registrada');

  const vazio = criarFakes([]);
  const r7 = await runDailyPhraseEngine(vazio.deps, '2026-08-01', rnd);
  ok(r7.status === 'sem_frases', 'cenário 10: base vazia retorna sem_frases controlado');

  const comInativa = criarFakes([frase('x'), { ...frase('y'), ativo: false }]);
  const r8 = await runDailyPhraseEngine(comInativa.deps, '2026-08-01', rnd);
  ok(r8.status === 'ok' && r8.frase.id === 'x', 'frase inativa nunca é sorteada');

  // Estresse: 500 dias, base de 7 — nunca repete dentro de um ciclo
  const sete = criarFakes(['p', 'q', 'r', 's', 't', 'u', 'v'].map(frase));
  const vistoPorCiclo = new Map<number, Set<string>>();
  for (let i = 0; i < 500; i += 1) {
    const d = new Date(2026, 0, 1 + i);
    const iso = getTodayLocalDateString(d);
    const r = await runDailyPhraseEngine(sete.deps, iso, rnd);
    if (r.status !== 'ok') {
      throw new Error('estresse: sem_frases inesperado');
    }
    const cicloAtual = sete.ciclos[sete.ciclos.length - 1].id;
    const visto = vistoPorCiclo.get(cicloAtual) ?? new Set<string>();
    if (visto.has(r.frase.id)) {
      throw new Error(`estresse: repetiu ${r.frase.id} no ciclo ${cicloAtual}`);
    }
    visto.add(r.frase.id);
    vistoPorCiclo.set(cicloAtual, visto);
  }
  ok(true, `estresse: 500 dias seguidos, ${sete.ciclos.length} ciclos, zero repetições dentro de ciclo`);
}

function testesCompartilhamento(): void {
  const exemplo: Phrase = {
    id: 'frase-001',
    texto: 'A jornada de mil quilômetros começa com um único passo.',
    autor: 'Lao Tsé',
    categoria: 'Persistência',
    ativo: true,
  };
  const esperado = '\u201CA jornada de mil quilômetros começa com um único passo.\u201D\n\n\u2014 Lao Tsé\n\n' + ASSINATURA_APP;
  ok(formatPhraseForSharing(exemplo) === esperado, 'compartilhamento: formato conforme a seção 8 do MD');
}

function testesHorario(): void {
  ok(parseHorario('08:00').hora === 8 && parseHorario('08:00').minuto === 0, 'horário: "08:00" interpretado');
  ok(parseHorario('23:59').hora === 23 && parseHorario('23:59').minuto === 59, 'horário: limite superior aceito');
  const invalidos = [null, '', 'abc', '25:00', '12:75'];
  const todosCaemNoPadrao = invalidos.every((v) => {
    const r = parseHorario(v);
    return r.hora === 8 && r.minuto === 0;
  });
  ok(todosCaemNoPadrao, 'horário: valores ausentes/corrompidos caem no padrão 08:00');
}

function testesData(): void {
  ok(getTodayLocalDateString(new Date(2026, 0, 5)) === '2026-01-05', 'data: formato YYYY-MM-DD com zeros à esquerda');
  ok(getTodayLocalDateString(new Date(2026, 11, 31)) === '2026-12-31', 'data: dezembro correto (mês 1-based na saída)');
}

function testesAvaliacao(): void {
  const agora = new Date('2026-10-21T12:00:00.000Z');
  const dia = 86_400_000;
  const elegivel: ReviewEligibilityInput = {
    firstUseDate: '2026-10-10',
    daysOfUse: 6,
    reviewCompleted: false,
    reviewSnoozeCount: 0,
    reviewNextPromptAt: null,
    phraseShownToday: true,
  };

  ok(shouldPromptReview(elegivel, agora), 'avaliação: aparece quando todas as condições são atendidas');
  ok(!shouldPromptReview({ ...elegivel, phraseShownToday: false }, agora), 'avaliação: só com a frase na tela');
  ok(!shouldPromptReview({ ...elegivel, firstUseDate: null }, agora), 'avaliação: sem uso registrado não aparece');
  ok(!shouldPromptReview({ ...elegivel, firstUseDate: '2026-10-17' }, agora), 'avaliação: espera 7 dias desde o primeiro uso');
  ok(!shouldPromptReview({ ...elegivel, daysOfUse: 4 }, agora), 'avaliação: exige 5 dias de uso');
  ok(
    !shouldPromptReview({ ...elegivel, reviewNextPromptAt: '2026-11-01T00:00:00.000Z' }, agora) &&
      shouldPromptReview({ ...elegivel, reviewNextPromptAt: '2026-10-21T11:00:00.000Z' }, agora),
    'avaliação: respeita a data do próximo pedido e libera depois dela',
  );
  ok(
    !shouldPromptReview({ ...elegivel, reviewCompleted: true }, agora) &&
      !shouldPromptReview({ ...elegivel, reviewSnoozeCount: 3 }, agora),
    'avaliação: nunca mais pergunta após avaliar ou após 3 adiamentos',
  );
  ok(
    parseStoredTimestamp('2026-10-01 12:00:00') === Date.parse('2026-10-01T12:00:00Z') &&
      parseStoredTimestamp('não é data') === null,
    'avaliação: interpreta datas salvas e rejeita texto inválido',
  );

  const sim = getReviewStateAfterAnswer('yes', 1, agora);
  ok(sim.reviewCompleted === true && sim.reviewNextPromptAt === null, 'avaliação: "sim" conclui o pedido');
  const depois = getReviewStateAfterAnswer('later', 1, agora);
  ok(
    depois.reviewSnoozeCount === 2 &&
      depois.reviewNextPromptAt === new Date(agora.getTime() + REVIEW_SNOOZE_DAYS * dia).toISOString(),
    'avaliação: "agora não" adia 30 dias e conta o adiamento',
  );
  const melhorar = getReviewStateAfterAnswer('improve', 1, agora);
  ok(
    melhorar.reviewSnoozeCount === undefined &&
      melhorar.reviewNextPromptAt === new Date(agora.getTime() + REVIEW_FEEDBACK_COOLDOWN_DAYS * dia).toISOString(),
    'avaliação: "pode melhorar" aguarda 60 dias sem contar adiamento',
  );

  const url = buildFeedbackMailtoUrl({
    category: 'Frases',
    message: 'Mais frases de poetas & escritores.',
    appVersion: '1.0.0',
    platform: 'android',
    osVersion: '35',
  });
  const consulta = new URLSearchParams(url.slice(url.indexOf('?') + 1));
  ok(
    url.startsWith(`mailto:${REVIEW_FEEDBACK_EMAIL}?subject=`) &&
      consulta.get('subject') === 'Sugestão — Frase do Dia (Frases)' &&
      (consulta.get('body') ?? '').includes('Mais frases de poetas & escritores.') &&
      (consulta.get('body') ?? '').includes('Frase do Dia 1.0.0 · android 35'),
    'avaliação: mailto com assunto, mensagem e dados do app codificados',
  );
}

async function main(): Promise<void> {
  await testesBaseDeFrases();
  testesDiff();
  await testesMotor();
  testesCompartilhamento();
  testesHorario();
  testesData();
  testesAvaliacao();
  console.log(`\n${total} verificações passaram.`);
}

main().catch((erro: Error) => {
  console.error(erro.message);
  process.exit(1);
});
