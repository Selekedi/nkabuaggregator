// 1. Define your app's default location
const DEFAULT_LOCATION = {
  lat: -25.1667, // Example: Groblersdal, South Africa
  lng: 29.4000
};

export default function getUserLocationWithFallback() {
  return new Promise((resolve) => {
    // 2. Check if the browser supports geolocation
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported. Using default location.");
      resolve(DEFAULT_LOCATION);
      return;
    }

    // 3. Request the current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Success: Return real user location
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // Error or user rejection: Fallback to default location
        console.warn(`Geolocation error (${error.message}). Using default location.`);
        resolve(DEFAULT_LOCATION);
      }
    );
  });
}




