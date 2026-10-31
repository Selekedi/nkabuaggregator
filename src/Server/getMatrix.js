const API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';
const ENDPOINT = 'https://googleapis.com';

/**
 * Calculates distances and travel times from one origin to multiple destinations,
 * returning the results in the exact same array order as the input.
 * 
 * @param {Object} originCoords - { lat: number, lng: number }
 * @param {Array<Object>} destinationsArray - Array of items containing coordinates
 * @returns {Promise<Array>} - Ordered results array safe for frontend indexing
 */
async function getOneToManyRoutes(originCoords, destinationsArray) {
  // 1. Map your destinations array into the payload format Google expects
  const formattedDestinations = destinationsArray.map(dest => ({
    waypoint: {
      location: {
        latLng: { latitude: dest.lat, longitude: dest.lng }
      },
      sideOfRoad: true // Ensures it snaps to the house side of the street
    }
  }));

  // 2. Build the payload
  const requestBody = {
    origins: [
      {
        waypoint: {
          location: {
            latLng: { latitude: originCoords.lat, longitude: originCoords.lng }
          },
          sideOfRoad: true
        }
      }
    ],
    destinations: formattedDestinations, 
    travelMode: "DRIVE",
    routingPreference: "TRAFFIC_AWARE"
  };

  try {
    const response = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': API_KEY,
        'X-Goog-FieldMask': 'originIndex,destinationIndex,status,distanceMeters,duration'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${JSON.stringify(errorData)}`);
    }

    const rawMatrixData = await response.json();
    
    // 3. Initialize a fixed-size array to reconstruct the order safely
    const orderedResults = new Array(destinationsArray.length);

    // 4. Sort and parse the out-of-order response back to matching index slots
    rawMatrixData.forEach((element) => {
      const idx = element.destinationIndex;

      // Safety check for empty or unexpected indices
      if (idx === undefined || idx >= destinationsArray.length) return;

      // Safely parse duration out of its string wrapper (e.g. "720s" -> 720)
      let durationSeconds = 0;
      if (element.duration) {
        durationSeconds = parseInt(element.duration.replace('s', ''), 10);
      }

      // Populate the exact corresponding index slot
      orderedResults[idx] = {
        originalIndex: idx,
        destinationData: destinationsArray[idx], // Includes names, IDs, metadata passed in
        success: !element.status || !element.status.code,
        distanceMeters: element.distanceMeters || 0,
        durationSeconds: durationSeconds,
        formattedDuration: element.duration || "N/A",
        error: element.status && element.status.code ? element.status.message : null
      };
    });

    return orderedResults;

  } catch (error) {
    console.error("Failed to fetch matrix routes:", error);
    throw error;
  }
}

