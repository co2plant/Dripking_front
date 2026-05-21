let googleMapsPromise = null;

export const loadGoogleMapsAPI = (apiKey) => {
  if (!apiKey) {
    return Promise.reject(new Error('Google Maps API key is missing.'));
  }

  if (window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const callbackName = 'initMapCallback_' + Date.now();

    window[callbackName] = () => {
      resolve(window.google.maps);
      delete window[callbackName];
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}&libraries=maps,marker`;
    script.async = true;
    script.defer = true;
    script.onerror = (error) => {
      googleMapsPromise = null;
      delete window[callbackName];
      reject(error);
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
};
