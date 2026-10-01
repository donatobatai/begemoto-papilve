export type Locale = 'en' | 'lt' | 'fr';
export const localeFromPath = (path:string):Locale => path.startsWith('/lt')?'lt':path.startsWith('/fr')?'fr':'en';
export const ui = {
 en:{work:'The work',evidence:'Enter the evidence ↗',glance:'CV at a glance +',surface:'The surface is only the beginning',position:'Product & AI systems.\nCommercial intelligence.\nMaking the pieces work.',under:'Go underneath',pause:'Pause film',resume:'Play film',short:'The short version',legacy:'Legacy'},
 lt:{work:'Patirtis',evidence:'Peržiūrėti darbus ↗',glance:'CV trumpai +',surface:'Paviršius – tik pradžia',position:'Produktų ir DI sistemos.\nKomercinė analitika.\nKad visos dalys veiktų kartu.',under:'Pažvelgti giliau',pause:'Pristabdyti',resume:'Tęsti',short:'Trumpai',legacy:'Archyvas'},
 fr:{work:'Parcours',evidence:'Voir les réalisations ↗',glance:"CV en bref +",surface:"La surface n’est qu’un début",position:'Produit & systèmes IA.\nIntelligence commerciale.\nFaire fonctionner les pièces ensemble.',under:'Voir en dessous',pause:'Pause',resume:'Reprendre',short:'En bref',legacy:'Archives'}
} as const;
export const languageNames={en:'EN',lt:'LT',fr:'FR'} as const;
