export interface SpotDef {
    id: string;
    label: string;
    x: number;
    y: number;
    radius: number;
}

export interface SpotDiffLevelDef {
    id: number;
    title: string;
    subtitle: string;
    timeLimit: number;
    wrongLimit: number;
    locked?: boolean;
    spots: SpotDef[];
}

export const SPOT_DIFF_LEVELS: SpotDiffLevelDef[] = [
    {
        id: 1,
        title: '太平小镇',
        subtitle: '海边社区',
        timeLimit: 90,
        wrongLimit: 5,
        spots: [
            { id: 'kite', label: '风筝', x: 0.76, y: 0.82, radius: 0.06 },
            { id: 'ball', label: '沙滩球', x: 0.42, y: 0.73, radius: 0.055 },
            { id: 'crab', label: '小螃蟹', x: 0.67, y: 0.69, radius: 0.055 },
            { id: 'sign', label: '路牌', x: 0.20, y: 0.45, radius: 0.06 },
            { id: 'umbrella', label: '彩伞', x: 0.48, y: 0.37, radius: 0.07 },
            { id: 'flower', label: '红花', x: 0.13, y: 0.26, radius: 0.055 },
        ],
    },
    {
        id: 2,
        title: '热闹集市',
        subtitle: '摊位与游客',
        timeLimit: 100,
        wrongLimit: 5,
        spots: [
            { id: 'cart', label: '小推车', x: 0.27, y: 0.66, radius: 0.07 },
            { id: 'hat', label: '草帽', x: 0.35, y: 0.31, radius: 0.055 },
            { id: 'drink', label: '饮料', x: 0.62, y: 0.54, radius: 0.055 },
            { id: 'shell', label: '贝壳', x: 0.18, y: 0.78, radius: 0.05 },
            { id: 'flag', label: '彩旗', x: 0.80, y: 0.28, radius: 0.055 },
        ],
    },
    {
        id: 3,
        title: '社区活动',
        subtitle: '完成前两关后开放',
        timeLimit: 120,
        wrongLimit: 4,
        locked: true,
        spots: [
            { id: 'stage', label: '舞台', x: 0.50, y: 0.50, radius: 0.06 },
        ],
    },
];
