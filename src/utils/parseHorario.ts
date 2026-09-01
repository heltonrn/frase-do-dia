export interface Horario {
  hora: number;
  minuto: number;
}

export const HORARIO_PADRAO: Horario = { hora: 8, minuto: 0 };

/**
 * Interpreta um horário persistido no formato "HH:MM".
 * Valores ausentes ou inválidos retornam o horário padrão (08:00),
 * garantindo que a tela nunca quebre por estado corrompido.
 */
export function parseHorario(valor: string | null): Horario {
  if (valor) {
    const [horaRaw, minutoRaw] = valor.split(':');
    const hora = Number(horaRaw);
    const minuto = Number(minutoRaw);
    const valido =
      Number.isInteger(hora) && hora >= 0 && hora <= 23 &&
      Number.isInteger(minuto) && minuto >= 0 && minuto <= 59;
    if (valido) {
      return { hora, minuto };
    }
  }
  return HORARIO_PADRAO;
}
