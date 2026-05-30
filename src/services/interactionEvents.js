import { apiService } from '@/services/api';

const ANONYMOUS_KEY = 'InteractionAnonymousKey';
const SUPPORTED_ITEM_TYPES = new Set(['ALCOHOL', 'DESTINATION', 'DISTILLERY']);

const getAnonymousKey = () => {
  const existingKey = localStorage.getItem(ANONYMOUS_KEY);
  if (existingKey) return existingKey;

  const nextKey = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(ANONYMOUS_KEY, nextKey);
  return nextKey;
};

export const recordInteractionEvent = async (itemType, targetId, eventType) => {
  if (!SUPPORTED_ITEM_TYPES.has(itemType) || targetId == null || !eventType) {
    return;
  }

  try {
    await apiService.postWithOptionalToken('interaction-events', {
      itemType,
      targetId: Number(targetId),
      eventType,
      anonymousKey: getAnonymousKey(),
    });
  } catch (error) {
    console.debug('Interaction event skipped:', error);
  }
};
