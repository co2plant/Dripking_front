export const TASTING_NOTE_RATING_FIELDS = [
  {key: 'appearance', label: '색/질감'},
  {key: 'aroma', label: '향'},
  {key: 'palate', label: '맛'},
  {key: 'finish', label: '여운'},
  {key: 'overall', label: '총점'}
];

export const TASTING_NOTE_TAG_GROUP_CONFIG = [
  {
    group: 'TASTING_AROMA',
    field: 'aromaTags',
    label: '향 표현'
  },
  {
    group: 'TASTING_PALATE',
    field: 'palateTags',
    label: '맛 표현'
  },
  {
    group: 'TASTING_FINISH',
    field: 'finishTags',
    label: '여운 표현'
  }
];

export const DEFAULT_TASTING_NOTE_TAG_GROUPS = [
  {
    group: 'TASTING_AROMA',
    field: 'aromaTags',
    label: '향 표현',
    options: ['과일', '꽃', '곡물', '견과', '향신료', '허브', '나무', '훈연']
  },
  {
    group: 'TASTING_PALATE',
    field: 'palateTags',
    label: '맛 표현',
    options: ['단맛', '산미', '쓴맛', '감칠맛', '바디감', '탄산감', '매운맛', '깔끔함']
  },
  {
    group: 'TASTING_FINISH',
    field: 'finishTags',
    label: '여운 표현',
    options: ['짧음', '긴 여운', '드라이', '달콤함', '따뜻함', '부드러움', '묵직함']
  }
];

export const buildTastingNoteTagGroups = (tags = []) => {
  const tagsByGroup = tags.reduce((groups, tag) => {
    if (!tag?.group || !tag?.name) return groups;
    const groupTags = groups.get(tag.group) || [];
    groups.set(tag.group, [...groupTags, tag]);
    return groups;
  }, new Map());

  const groups = TASTING_NOTE_TAG_GROUP_CONFIG.map((config) => {
    const groupTags = tagsByGroup.get(config.group) || [];
    const sortedTags = [...groupTags].sort((first, second) => {
      const firstOrder = Number.isFinite(Number(first.sortOrder)) ? Number(first.sortOrder) : 0;
      const secondOrder = Number.isFinite(Number(second.sortOrder)) ? Number(second.sortOrder) : 0;
      return firstOrder - secondOrder || first.name.localeCompare(second.name, 'ko-KR');
    });

    return {
      ...config,
      label: sortedTags[0]?.groupLabel || config.label,
      options: sortedTags.map((tag) => tag.name)
    };
  });

  return groups.some((group) => group.options.length > 0)
      ? groups
      : DEFAULT_TASTING_NOTE_TAG_GROUPS;
};
