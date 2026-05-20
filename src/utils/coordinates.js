export const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

export const getValidCoordinates = (source) => {
  const lat = parseCoordinate(source?.latitude);
  const lng = parseCoordinate(source?.longitude);

  if (lat === null || lng === null) {
    return null;
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null;
  }

  return { lat, lng };
};

export const hasValidCoordinates = (source) => getValidCoordinates(source) !== null;

export const normalizeCoordinates = (source) => {
  const coordinates = getValidCoordinates(source);

  return {
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lng ?? null,
  };
};
