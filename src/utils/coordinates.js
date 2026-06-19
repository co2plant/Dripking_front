export const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const coordinate = Number(value);
  return Number.isFinite(coordinate) ? coordinate : null;
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (value) => value * (Math.PI / 180);

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

export const getDistanceKm = (sourceA, sourceB) => {
  const coordinatesA = getValidCoordinates(sourceA);
  const coordinatesB = getValidCoordinates(sourceB);

  if (coordinatesA === null || coordinatesB === null) {
    return null;
  }

  const latDistance = toRadians(coordinatesB.lat - coordinatesA.lat);
  const lngDistance = toRadians(coordinatesB.lng - coordinatesA.lng);
  const startLat = toRadians(coordinatesA.lat);
  const endLat = toRadians(coordinatesB.lat);

  const haversine = Math.sin(latDistance / 2) ** 2
    + Math.cos(startLat) * Math.cos(endLat) * Math.sin(lngDistance / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
};

export const normalizeCoordinates = (source) => {
  const coordinates = getValidCoordinates(source);

  return {
    latitude: coordinates?.lat ?? null,
    longitude: coordinates?.lng ?? null,
  };
};

export const getValidCoordinateBounds = (source) => {
  const minLatitude = parseCoordinate(source?.minLatitude);
  const maxLatitude = parseCoordinate(source?.maxLatitude);
  const minLongitude = parseCoordinate(source?.minLongitude);
  const maxLongitude = parseCoordinate(source?.maxLongitude);

  if ([minLatitude, maxLatitude, minLongitude, maxLongitude].some((value) => value === null)) {
    return null;
  }

  if (minLatitude < -90 || maxLatitude > 90 || minLongitude < -180 || maxLongitude > 180) {
    return null;
  }

  if (minLatitude > maxLatitude || minLongitude > maxLongitude) {
    return null;
  }

  return {
    minLatitude,
    maxLatitude,
    minLongitude,
    maxLongitude,
  };
};

export const getCoordinateBoundsFromCenter = (source) => {
  const coordinates = getValidCoordinates(source);
  const radiusKm = parseCoordinate(source?.radiusKm);

  if (coordinates === null || radiusKm === null || radiusKm <= 0) {
    return null;
  }

  const latRadius = radiusKm / 111.32;
  const latRadians = coordinates.lat * (Math.PI / 180);
  const lngDistance = 111.32 * Math.max(Math.cos(latRadians), 0.01);
  const lngRadius = radiusKm / lngDistance;

  return getValidCoordinateBounds({
    minLatitude: Math.max(-90, coordinates.lat - latRadius),
    maxLatitude: Math.min(90, coordinates.lat + latRadius),
    minLongitude: Math.max(-180, coordinates.lng - lngRadius),
    maxLongitude: Math.min(180, coordinates.lng + lngRadius),
  });
};
