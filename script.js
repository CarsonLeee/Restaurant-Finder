let userLocation;
let restaurantMarker;
let map;
let service;
let isFirstSearch = true; // Add this line to keep track of the first search

// Animation for submit button
function animateButton() {
  const submitBtn = document.getElementById('submitBtn');
  const circleLoader = document.getElementById('circleLoader');

  if (isFirstSearch) { // Add this condition to update the button text after the first search
    submitBtn.innerHTML = '<span>Regenerate</span><div class="circle-loader" id="circleLoader"></div>';
    isFirstSearch = false;
  }

  submitBtn.classList.add('animate');
  setTimeout(() => {
    submitBtn.classList.remove('animate');
  }, 600);
}

// Function to hide the loading screen
function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");
  loadingScreen.style.display = "none";
}

// Modify the initMap function
function initMap() {
  const mapOptions = {
    zoom: 2,
    center: { lat: 0, lng: 0 },
    mapTypeId: 'roadmap' // Set map type to roadmap (default map view)
  };

  map = new google.maps.Map(document.getElementById("map"), mapOptions);
  service = new google.maps.places.PlacesService(map);

  const successCallback = (position) => {
    userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
  
    // Set the center and zoom level
    map.setCenter(userLocation);
    map.setZoom(15);
  
    // Create a blue marker for user's location
    new google.maps.Marker({
      position: userLocation,
      map: map,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      },
    });
  
    // Hide the loading screen after the map is initialized
    hideLoadingScreen();
  
    // Update spinner position based on the map center
    const spinner = document.querySelector(".spinner-border");
    spinner.classList.add("spinner-centered");
  }

  const errorCallback = (error) => {
    console.warn(`Error ${error.code}: ${error.message}`);
    alert("Unable to retrieve location. Please try again.");
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
  } else {
    alert("Geolocation is not supported by this browser.");
  }
}

function updateMap(radius) {

  if (!userLocation) return;

  // Check which checkboxes are selected
  const fastFoodCheckbox = document.getElementById("fastFood");
  const slowFoodCheckbox = document.getElementById("slowFood");

  // Define the keyword based on the selected checkboxes
  let keyword = "";
  if (fastFoodCheckbox.checked && !slowFoodCheckbox.checked) {
    keyword = "fast food";
  } else if (!fastFoodCheckbox.checked && slowFoodCheckbox.checked) {
    keyword = "slow food";
  }

  const request = {
    location: userLocation,
    radius: radius,
    type: "restaurant",
    keyword: keyword, // Include the keyword in the request
  };

  service.nearbySearch(request, (results, status) => {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      // Remove the previous restaurant marker, if any
      if (restaurantMarker) {
        restaurantMarker.setMap(null);
      }

      // Choose a random restaurant
      const randomIndex = Math.floor(Math.random() * results.length);
      const randomRestaurant = results[randomIndex];

      // Add the restaurant marker with a red color
      restaurantMarker = new google.maps.Marker({
        position: randomRestaurant.geometry.location,
        map: map,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });

      // Fit the map to show both the user location and the restaurant location
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(userLocation);
      bounds.extend(randomRestaurant.geometry.location);
      map.fitBounds(bounds);

      // Display the restaurant details
      const restaurantDetails = document.getElementById("restaurantDetails");
      const restaurantName = randomRestaurant.name;
      const restaurantAddress = randomRestaurant.vicinity;
      const restaurantRating = randomRestaurant.rating || "N/A";
      const cuisine = randomRestaurant.types[0];

      restaurantDetails.innerHTML = `
        <h3>${restaurantName}</h3>
        <p><strong>Address:</strong> ${restaurantAddress}</p>
        <p><strong>Rating:</strong> ${restaurantRating}/5</p>
        <p><strong>Cuisine:</strong> ${cuisine}</p>
      `;
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const rangeSlider = document.getElementById("rangeSlider");
  const rangeOutput = document.getElementById("rangeOutput");
  const submitBtn = document.getElementById("submitBtn");
  const fastFoodCheckbox = document.getElementById("fastFood");
  const slowFoodCheckbox = document.getElementById("slowFood");
  
  rangeOutput.textContent = rangeSlider.value + " km";
  
  // Slider to set the range of the search
  rangeSlider.addEventListener("input", () => {
  rangeOutput.textContent = rangeSlider.value + " km";
  });
  
  // Button used to find the nearby restaurants
  submitBtn.addEventListener("click", () => {
  // Animate the button
  animateButton();

  // Check if at least one of the checkboxes is checked
if (fastFoodCheckbox.checked || slowFoodCheckbox.checked) {
  updateMap(rangeSlider.value * 1000);
} else {
  alert("Please select Fast Food, Slow Food, or both to proceed.");
}
});

const darkModeBtn = document.getElementById("darkModeBtn");

// Button used to toggle light and dark mode
darkModeBtn.addEventListener("click", () => {
document.body.classList.toggle("dark-mode");
});

navigator.geolocation.getCurrentPosition((position) => {
userLocation = {
lat: position.coords.latitude,
lng: position.coords.longitude,
};
initMap(userLocation);
});
});