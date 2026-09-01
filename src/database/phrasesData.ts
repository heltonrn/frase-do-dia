import { Phrase, PhraseBasePackage } from '../types/Phrase';

/**
 * Base inicial de frases (versão 1 do conteúdo).
 *
 * Regras seguidas na curadoria (seção 4 do MD):
 * - sem frases duplicadas ou quase-duplicadas;
 * - autoria só é atribuída quando razoavelmente conhecida;
 * - "Autor desconhecido" é usado quando não há confirmação segura;
 * - nenhum conteúdo ofensivo, discriminatório ou inadequado.
 *
 * Este arquivo é o pacote v1 (65 frases). Uma futura atualização de
 * conteúdo deve criar um novo array (ex: phrasesData.v2.ts) somando
 * frases com ids novos aos ids já existentes — nunca reescrevendo um
 * id já publicado. Ver src/services/phraseSyncService.ts (Fase 3) para
 * a lógica de merge com o banco local.
 */
const frases: Phrase[] = [
  { id: 'frase-001', texto: 'A jornada de mil quilômetros começa com um único passo.', autor: 'Lao Tsé', categoria: 'Persistência', ativo: true },
  { id: 'frase-002', texto: 'Não é o mais forte que sobrevive, nem o mais inteligente, mas o que melhor se adapta às mudanças.', autor: 'Charles Darwin', categoria: 'Superação', ativo: true },
  { id: 'frase-003', texto: 'Conhece-te a ti mesmo.', autor: 'Sócrates', categoria: 'Sabedoria', ativo: true },
  { id: 'frase-004', texto: 'Não é o que nos acontece, mas como reagimos ao que nos acontece, que importa.', autor: 'Epicteto', categoria: 'Reflexão', ativo: true },
  { id: 'frase-005', texto: 'A sorte favorece a mente preparada.', autor: 'Louis Pasteur', categoria: 'Foco', ativo: true },
  { id: 'frase-006', texto: 'Quem tem um porquê para viver pode suportar quase todos os comos.', autor: 'Friedrich Nietzsche', categoria: 'Vida', ativo: true },
  { id: 'frase-007', texto: 'O que fazemos por nós mesmos morre conosco. O que fazemos pelos outros permanece.', autor: 'Albert Pine', categoria: 'Relacionamentos', ativo: true },
  { id: 'frase-008', texto: 'Feliz aquele que transfere o que sabe e aprende o que ensina.', autor: 'Cora Coralina', categoria: 'Estudos', ativo: true },
  { id: 'frase-009', texto: 'Antes de ganhar, é preciso aprender a perder com dignidade.', autor: 'Autor desconhecido', categoria: 'Superação', ativo: true },
  { id: 'frase-010', texto: 'Trabalhar com amor é dar à luz um pedaço de si mesmo.', autor: 'Autor desconhecido', categoria: 'Trabalho', ativo: true },
  { id: 'frase-011', texto: 'Um passo à frente e você não está mais no mesmo lugar.', autor: 'Chico Science', categoria: 'Motivação', ativo: true },
  { id: 'frase-012', texto: 'Só se vê bem com o coração; o essencial é invisível aos olhos.', autor: 'Antoine de Saint-Exupéry', categoria: 'Reflexão', ativo: true },
  { id: 'frase-013', texto: 'A persistência é o caminho do êxito.', autor: 'Charles Chaplin', categoria: 'Persistência', ativo: true },
  { id: 'frase-014', texto: 'Ninguém é tão grande que não possa aprender, nem tão pequeno que não possa ensinar.', autor: 'Esopo', categoria: 'Sabedoria', ativo: true },
  { id: 'frase-015', texto: 'O importante não é vencer todos os dias, mas lutar sempre.', autor: 'Waldemar Valle Martins', categoria: 'Disciplina', ativo: true },
  { id: 'frase-016', texto: 'Gratidão é a memória do coração.', autor: 'Jean Baptiste Massieu', categoria: 'Gratidão', ativo: true },
  { id: 'frase-017', texto: 'Nada do que foi será de novo do jeito que já foi um dia.', autor: 'Renato Russo', categoria: 'Vida', ativo: true },
  { id: 'frase-018', texto: 'Faça o que puder, com o que tiver, no lugar em que estiver.', autor: 'Theodore Roosevelt', categoria: 'Motivação', ativo: true },
  { id: 'frase-019', texto: 'A disciplina é a ponte entre metas e conquistas.', autor: 'Jim Rohn', categoria: 'Disciplina', ativo: true },
  { id: 'frase-020', texto: 'Rir é o remédio mais barato que existe, e ainda vem sem bula.', autor: 'Autor desconhecido', categoria: 'Humor/reflexão leve', ativo: true },
  { id: 'frase-021', texto: 'A vida é aquilo que acontece enquanto você está ocupado fazendo outros planos.', autor: 'John Lennon', categoria: 'Vida', ativo: true },
  { id: 'frase-022', texto: 'Não temas ir devagar, teme apenas ficar parado.', autor: 'Provérbio chinês', categoria: 'Persistência', ativo: true },
  { id: 'frase-023', texto: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.', autor: 'Robert Collier', categoria: 'Sucesso', ativo: true },
  { id: 'frase-024', texto: 'Coragem não é a ausência de medo, mas o triunfo sobre ele.', autor: 'Nelson Mandela', categoria: 'Coragem', ativo: true },
  { id: 'frase-025', texto: 'A amizade multiplica os bens e divide os males.', autor: 'Cícero', categoria: 'Relacionamentos', ativo: true },
  { id: 'frase-026', texto: 'Aprender é a única coisa de que a mente nunca se cansa, nunca tem medo e nunca se arrepende.', autor: 'Leonardo da Vinci', categoria: 'Estudos', ativo: true },
  { id: 'frase-027', texto: 'Quem sabe faz a hora, não espera acontecer.', autor: 'Geraldo Vandré', categoria: 'Motivação', ativo: true },
  { id: 'frase-028', texto: 'Cair não é fracasso; fracasso é ficar onde caiu.', autor: 'Autor desconhecido', categoria: 'Superação', ativo: true },
  { id: 'frase-029', texto: 'A verdadeira riqueza está em contentar-se com pouco.', autor: 'Sêneca', categoria: 'Sabedoria', ativo: true },
  { id: 'frase-030', texto: 'Não deixe que o barulho da opinião alheia abafe sua voz interior.', autor: 'Steve Jobs', categoria: 'Foco', ativo: true },
  { id: 'frase-031', texto: 'Cada dia é uma nova oportunidade de mudar a sua vida.', autor: 'Autor desconhecido', categoria: 'Motivação', ativo: true },
  { id: 'frase-032', texto: 'A gratidão transforma o que temos em suficiente.', autor: 'Autor desconhecido', categoria: 'Gratidão', ativo: true },
  { id: 'frase-033', texto: 'Onde há disciplina, a liberdade cresce em terreno seguro.', autor: 'Autor desconhecido', categoria: 'Disciplina', ativo: true },
  { id: 'frase-034', texto: 'O trabalho duro vence o talento quando o talento não trabalha duro.', autor: 'Tim Notke', categoria: 'Trabalho', ativo: true },
  { id: 'frase-035', texto: 'Feliz é quem transfere o que sabe e aprende o que ensina, sem perder tempo comparando.', autor: 'Autor desconhecido', categoria: 'Felicidade', ativo: true },
  { id: 'frase-036', texto: 'Quem cai e se levanta é mais forte do que quem nunca caiu.', autor: 'Provérbio popular', categoria: 'Superação', ativo: true },
  { id: 'frase-037', texto: 'A calma é a maior arma contra as dificuldades.', autor: 'Marco Aurélio', categoria: 'Reflexão', ativo: true },
  { id: 'frase-038', texto: 'Não existe caminho para a felicidade: a felicidade é o caminho.', autor: 'Mahatma Gandhi', categoria: 'Felicidade', ativo: true },
  { id: 'frase-039', texto: 'Só se aprende de duas maneiras: pela dor ou pela repetição.', autor: 'Autor desconhecido', categoria: 'Estudos', ativo: true },
  { id: 'frase-040', texto: 'O foco é dizer não a mil boas ideias para dizer sim a uma só.', autor: 'Autor desconhecido', categoria: 'Foco', ativo: true },
  { id: 'frase-041', texto: 'Grandes conquistas nascem de decisões pequenas, tomadas todos os dias.', autor: 'Autor desconhecido', categoria: 'Sucesso', ativo: true },
  { id: 'frase-042', texto: 'A coragem começa com pequenos passos, não com grandes discursos.', autor: 'Autor desconhecido', categoria: 'Coragem', ativo: true },
  { id: 'frase-043', texto: 'Um amigo verdadeiro é quem sabe a sua história e ainda assim gosta de você.', autor: 'Elbert Hubbard', categoria: 'Relacionamentos', ativo: true },
  { id: 'frase-044', texto: 'A vida é curta demais para ser vivida com medo.', autor: 'Autor desconhecido', categoria: 'Vida', ativo: true },
  { id: 'frase-045', texto: 'Quem planta paciência colhe segurança.', autor: 'Provérbio popular', categoria: 'Persistência', ativo: true },
  { id: 'frase-046', texto: 'Sabedoria não é saber muito, mas saber o que realmente importa.', autor: 'Autor desconhecido', categoria: 'Sabedoria', ativo: true },
  { id: 'frase-047', texto: 'Um pouco de humor evita que os problemas fiquem pesados demais.', autor: 'Autor desconhecido', categoria: 'Humor/reflexão leve', ativo: true },
  { id: 'frase-048', texto: 'O melhor projeto que você vai construir é a sua própria disciplina diária.', autor: 'Autor desconhecido', categoria: 'Disciplina', ativo: true },
  { id: 'frase-049', texto: 'Gratidão não é sobre o que falta, é sobre o que já chegou.', autor: 'Autor desconhecido', categoria: 'Gratidão', ativo: true },
  { id: 'frase-050', texto: 'Fazer bem feito é o que separa um trabalho de um legado.', autor: 'Autor desconhecido', categoria: 'Trabalho', ativo: true },
  { id: 'frase-051', texto: 'A persistência realiza o impossível.', autor: 'Provérbio popular', categoria: 'Persistência', ativo: true },
  { id: 'frase-052', texto: 'Não julgue cada dia pela colheita que você recolhe, mas pelas sementes que planta.', autor: 'Robert Louis Stevenson', categoria: 'Reflexão', ativo: true },
  { id: 'frase-053', texto: 'Estudar é adiantar-se ao futuro que ainda vai chegar.', autor: 'Autor desconhecido', categoria: 'Estudos', ativo: true },
  { id: 'frase-054', texto: 'Um sorriso não custa nada e vale muito.', autor: 'Provérbio popular', categoria: 'Felicidade', ativo: true },
  { id: 'frase-055', texto: 'Toda grande mudança parece impossível até que ela aconteça.', autor: 'Nelson Mandela', categoria: 'Motivação', ativo: true },
  { id: 'frase-056', texto: 'Foco não é fazer mais coisas, é eliminar o que não importa.', autor: 'Autor desconhecido', categoria: 'Foco', ativo: true },
  { id: 'frase-057', texto: 'O sucesso é ir de fracasso em fracasso sem perder o entusiasmo.', autor: 'Winston Churchill', categoria: 'Sucesso', ativo: true },
  { id: 'frase-058', texto: 'A coragem de começar já separa quem sonha de quem realiza.', autor: 'Autor desconhecido', categoria: 'Coragem', ativo: true },
  { id: 'frase-059', texto: 'Quem caminha sozinho pode até chegar mais rápido, mas quem vai acompanhado chega mais longe.', autor: 'Provérbio africano', categoria: 'Relacionamentos', ativo: true },
  { id: 'frase-060', texto: 'A vida não se mede pelo número de respirações que damos, mas pelos momentos que nos tiram o fôlego.', autor: 'Autor desconhecido', categoria: 'Vida', ativo: true },
  { id: 'frase-061', texto: 'Ser grato pelo pouco é o primeiro passo para receber o muito.', autor: 'Autor desconhecido', categoria: 'Gratidão', ativo: true },
  { id: 'frase-062', texto: 'A sabedoria começa no momento em que você admite não saber tudo.', autor: 'Autor desconhecido', categoria: 'Sabedoria', ativo: true },
  { id: 'frase-063', texto: 'Levar a vida com leveza também é uma forma de coragem.', autor: 'Autor desconhecido', categoria: 'Humor/reflexão leve', ativo: true },
  { id: 'frase-064', texto: 'Disciplina é escolher entre o que você quer agora e o que você quer mais.', autor: 'Autor desconhecido', categoria: 'Disciplina', ativo: true },
  { id: 'frase-065', texto: 'O trabalho bem feito de hoje é o descanso tranquilo de amanhã.', autor: 'Autor desconhecido', categoria: 'Trabalho', ativo: true },
];

export const phrasesPackageV1: PhraseBasePackage = {
  versaoBase: 1,
  frases,
};

export default phrasesPackageV1;
