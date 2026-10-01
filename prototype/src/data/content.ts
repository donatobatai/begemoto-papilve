export type Capability = {
  id: string;
  number: string;
  short: string;
  title: string;
  description: string;
  evidence: string;
  image: string;
  scene: string;
  detail: string;
  accent: string;
  field: string;
};

export const capabilities: Capability[] = [
  {
    id: 'lead',
    number: '01',
    short: 'Product',
    title: 'Product & AI systems',
    description:
      'Shaping useful digital products where people, intelligent systems and operational reality meet.',
    evidence:
      'A future evidence layer for product thinking, AI-enabled workflows, prototypes and live systems. Specific 2026 work will replace this provisional structure.',
    image: '/head-web.png',
    scene: '/rasp.jpg',
    detail: '/hidd3-bcg.jpg',
    accent: '#f04d33',
    field: 'Systems / interfaces / intelligence',
  },
  {
    id: 'shape',
    number: '02',
    short: 'Data',
    title: 'Data & decision systems',
    description:
      'Turning scattered information into a legible picture that supports judgement, priority and action.',
    evidence:
      'A future home for analytical work, BI views, decision frameworks and dashboard artefacts. No achievement claim is implied.',
    image: '/brain-types.png',
    scene: '/sun.jpg',
    detail: '/hidd2-bcg.jpg',
    accent: '#d6ad33',
    field: 'Signals / models / decisions',
  },
  {
    id: 'deliver',
    number: '03',
    short: 'Revenue',
    title: 'Revenue & operations',
    description:
      'Connecting commercial intent to the processes, rhythms and tools that let teams execute consistently.',
    evidence:
      'A future home for operating models, commercial systems and cross-functional delivery examples. Final evidence will be supplied later.',
    image: '/brain-crowd.png',
    scene: '/cucumber.jpg',
    detail: '/hidd1-bcg.jpg',
    accent: '#75bdb4',
    field: 'Growth / process / momentum',
  },
  {
    id: 'connect',
    number: '04',
    short: 'Strategy',
    title: 'Strategy & delivery',
    description:
      'Framing difficult problems, aligning stakeholders and carrying a coherent direction into delivery.',
    evidence:
      'A future home for programme work, problem-solving narratives, CIOS and selected project artefacts.',
    image: '/brain-experiential.png',
    scene: '/greip2.jpg',
    detail: '/hidd4-bcg.jpg',
    accent: '#eee9de',
    field: 'Direction / people / delivery',
  },
];
