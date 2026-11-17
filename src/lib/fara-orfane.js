/**
 * fara_orfane.js - lipeste cu spatiu neseparabil (U+00A0) cuvintele care nu au voie sa ramana singure la capat de rand.
 *
 *   import { faraOrfane, faraOrfaneHtml } from './fara_orfane.js'
 *   faraOrfane('Gata, legătura este făcută')          // 'Gata, legătura este făcută'
 *   faraOrfaneHtml('<p>Text cu <b>etichete</b> aici.</p>') // atinge doar textul, nu etichetele
 *
 * Se aplica pe text simplu (string-uri din JSX, campuri din CMS, continut de email), NICIODATA pe cod sau atribute.
 */
export const NBSP = ' ';

// Cuvinte de legatura care nu stau la capat de rand: se lipesc de cuvantul urmator.
export const CUVINTE_SCURTE = new Set([
  'a', 'ai', 'al', 'ale', 'am', 'ar', 'au', 'ca', 'că', 'ce', 'cu', 'da', 'dar', 'de', 'despre', 'din', 'dintr-o',
  'dintr-un', 'e', 'ea', 'ei', 'el', 'eu', 'fi', 'fără', 'i', 'iar', 'in', 'în', 'îi', 'îl', 'îmi', 'într-o', 'într-un',
  'își', 'îți', 'la', 'le', 'li', 'lui', 'mai', 'mă', 'mi', 'ne', 'nu', 'o', 'or', 'pe', 'pentru', 'prin', 'printr-o',
  'printr-un', 'sa', 'sau', 'să', 'se', 'si', 'spre', 'sub', 'și', 'te', 'ți', 'tu', 'un', 'va', 'vă', 'vom',
]);

const CRATIME = new Set(['-', '–', '—']);
const LIPIRE_FINAL_MAX = 24; // ultimele doua cuvinte se lipesc doar daca impreuna sunt scurte (altfel pot iesi din cutie pe mobil)

const radacina = (tok) => tok.toLowerCase().replace(/^[„"“«(\[]+/u, '').replace(/[”"»)\].,;:!?…]+$/u, '');

function aseazaRand(rand) {
  const [, inainte, miez, dupa] = rand.match(/^(\s*)([\s\S]*?)(\s*)$/);
  const tok = miez.split(/ +/).filter(Boolean); // doar spatiul obisnuit separa; NBSP-urile existente raman in token
  if (tok.length < 2) return rand;
  // lipit[i] = spatiul dintre tok[i] si tok[i+1] devine neseparabil
  const lipit = tok.slice(1).map((dupaSpatiu, i) => {
    const r = radacina(tok[i]);
    return CUVINTE_SCURTE.has(r) || /^\d[\d.,]*$/.test(r) || CRATIME.has(dupaSpatiu); // scurt, numar + unitate, cratima ramane sus
  });
  const n = tok.length;
  if ((tok[n - 2] + tok[n - 1]).length < LIPIRE_FINAL_MAX) lipit[n - 2] = true;
  return inainte + tok.reduce((acc, t, i) => acc + (lipit[i - 1] ? NBSP : ' ') + t) + dupa;
}

export function faraOrfane(text) {
  if (typeof text !== 'string' || !text) return text;
  return text.split('\n').map(aseazaRand).join('\n');
}

export function faraOrfaneHtml(html) {
  let inCod = false;
  return html
    .split(/(<[^>]+>)/)
    .map((parte) => {
      if (parte.startsWith('<')) {
        if (/^<(script|style|pre|code|textarea)\b/i.test(parte)) inCod = true;
        else if (/^<\/(script|style|pre|code|textarea)>/i.test(parte)) inCod = false;
        return parte;
      }
      return inCod ? parte : faraOrfane(parte);
    })
    .join('');
}
