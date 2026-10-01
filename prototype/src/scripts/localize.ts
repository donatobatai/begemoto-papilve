import {copy} from '../i18n/content';
import {ui,type Locale} from '../i18n/ui';
const locale=(document.documentElement.lang||'en') as Locale;
if(locale!=='en'){
 const dict:Record<string,string>={...copy[locale],
  'The work':ui[locale].work,'Enter the evidence ↗':ui[locale].evidence,'Legacy':ui[locale].legacy,'CV at a glance +':ui[locale].glance,
  'The surface is only the beginning':ui[locale].surface,'Go underneath':ui[locale].under,'Pause film':ui[locale].pause,
  'Product & AI systems.':locale==='lt'?'Produktų ir DI sistemos.':'Produit & systèmes IA.',
  'Commercial intelligence.':locale==='lt'?'Komercinė analitika.':'Intelligence commerciale.',
  'Making the pieces work.':locale==='lt'?'Kad visos dalys veiktų kartu.':'Faire fonctionner les pièces ensemble.'
 };
 const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
 const nodes:Text[]=[]; while(walker.nextNode()) nodes.push(walker.currentNode as Text);
 for(const node of nodes){const raw=node.nodeValue||'';const key=raw.trim();const value=dict[key];if(value) node.nodeValue=raw.replace(key,value);}
 document.querySelectorAll<HTMLElement>('[aria-label]').forEach(el=>{const a=el.getAttribute('aria-label'); if(a&&dict[a])el.setAttribute('aria-label',dict[a]);});
}
