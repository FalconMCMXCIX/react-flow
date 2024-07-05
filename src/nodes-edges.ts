const position = { x: 0, y: 0 };
const edgeType = 'smoothstep';

export const initialNodes = [
    {
        id: '1',
        type: 'customNode',
        data: {
            label: 'Axborot tizimlarini tahlil qilish va loyihalash bolimi' },
        position,
    },
    {
        id: '2',
        type: 'customNode',
        data: {
            label: 'Loyihaviy-texnik hujjatlar va normativ-huquqiy hujjatlarni ishlab chiqish bolimi' },
        position,
    },
    {
        id: '2a',
        type: 'customNode',
        data: { label: 'Strategik rejalashtirish va moliyalashtirishni tahlil qilish boshqarmasi' },
        position,
    },
    {
        id: '2b',
        type: 'customNode',
        data: { label: 'UZSOC kiberxavfsizlik monitoringi xizmati direktori' },
        position,
    },
    {
        id: '2c',
        type: 'customNode',
        data: { label: 'Sog‘liqni saqlashni raqamlashtirish bo‘yicha islohotlarni qo‘llab-quvvatlash departamenti' },
        position,
    },
    {
        id: '2d',
        type: 'customNode',
        data: { label: 'Sanoat axborotlashtirish va avtomatlashtirish tizimlari departamenti' },
        position,
    },
    {
        id: '3',
        type: 'customNode',
        data: { label: 'Axborot xavfsizligi hodisalarini monitoring qilish departamenti' },
        position,
    },
    {
        id: '4',
        type: 'customNode',
        data: { label: 'O‘zbekiston Respublikasi Hukumat portalining Internet tarmog‘ida axborotni qo‘llab-quvvatlash va rivojlantirish guruhi' },
        position,
    },
    {
        id: '5',
        type: 'customNode',
        data: { label: 'O‘zbekiston Respublikasi Hukumat portalining Internet tarmog‘ida axborotni qo‘llab-quvvatlash va rivojlantirish guruhi' },
        position,
    },
    {
        id: '6',
        type: 'customNode',
        data: {
            label: 'Harbiylashtirilgan tuzilmalarda axborot texnologiyalarini joriy etish departamenti' },
        position,
    },
    {
        id: '7',
        type: 'customNode',
        data: { label: 'O‘zbekiston Respublikasi Harbiylashtirilgan tuzilmalarda axborot texnologiyalarini joriy etish departamenti' },
        position,
    },
];

export const initialEdges = [
    { id: 'e12', source: '1', target: '2', type: edgeType, animated: true },
    { id: 'e13', source: '1', target: '3', type: edgeType, animated: true },
    { id: 'e22a', source: '2', target: '2a', type: edgeType, animated: true },
    { id: 'e22b', source: '2', target: '2b', type: edgeType, animated: true },
    { id: 'e22c', source: '2', target: '2c', type: edgeType, animated: true },
    { id: 'e2c2d', source: '2c', target: '2d', type: edgeType, animated: true },
    { id: 'e45', source: '4', target: '5', type: edgeType, animated: true },
    { id: 'e56', source: '5', target: '6', type: edgeType, animated: true },
    { id: 'e57', source: '5', target: '7', type: edgeType, animated: true },
];
