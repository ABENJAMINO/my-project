const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const resultsContainer = document.getElementById("results");
const disk = document.querySelector(".disk");
const songTitle = document.querySelector(".song-title");
const loadingSpinner = document.getElementById("loadingSpinner");

let currentAudio = null;

searchButton.addEventListener("click", handleSearch);
searchInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") handleSearch();
});

function handleSearch() {
  const query = searchInput.value.trim();
  resultsContainer.innerHTML = "";
  clearErrorMessage();

  if (!query) {
    displayMessage("Please enter a search term.");
    return;
  }

  showLoading(true);
  fetchMusicTracks(query);
}

document.querySelector(".links-container").addEventListener("click", (event) => {
  if (event.target.classList.contains("highlightable")) {
    document.querySelectorAll(".highlightable").forEach((link) =>
      link.classList.remove("highlight")
    );
    event.target.classList.add("highlight");
  }
});

async function fetchMusicTracks(query) {
  try {
    const proxy = "https://proxy.cors.sh/";
    const apiURL = `${proxy}https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=10`;

    const response = await fetch(apiURL, {
      headers: { "x-requested-with": "XMLHttpRequest" },
    });

    if (!response.ok) {
      displayMessage("Oops, try again! Something went wrong.");
      return;
    }

    const data = await response.json();

    if (!data.data || data.data.length === 0) {
      displayMessage("Oops, try again! No tracks found for your search.");
      return;
    }

    displayTracks(data.data);
  } catch (error) {
    console.error(`Error fetching tracks for query "${query}":`, error);
    displayMessage("Oops, try again! Unable to fetch tracks.");
  } finally {
    showLoading(false);
  }
}

function displayTracks(tracks) {
  tracks.forEach((track) => {
    const trackDiv = document.createElement("div");
    trackDiv.className = "track";

    const title = document.createElement("h3");
    title.textContent = truncate(track.title);

    const artist = document.createElement("p");
    artist.textContent = `Artist: ${track.artist.name}`;

    const album = document.createElement("p");
    album.textContent = `Album: ${track.album.title}`;

    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = track.preview;

    audio.addEventListener("play", () => {
      if (currentAudio && currentAudio !== audio && !currentAudio.paused) {
        currentAudio.pause();
      }
      currentAudio = audio;
      disk.style.animation = "rolling 2s linear infinite";
      songTitle.textContent = `Now Playing: ${track.title} by ${track.artist.name}`;
    });

    audio.addEventListener("pause", () => {
      disk.style.animation = "none";
    });

    trackDiv.append(title, artist, album, audio);
    resultsContainer.appendChild(trackDiv);
  });
}

function displayMessage(message) {
  const messageDiv = document.createElement("div");
  messageDiv.textContent = message;
  messageDiv.className = "message";
  resultsContainer.appendChild(messageDiv);

  setTimeout(() => {
    messageDiv.style.opacity = 1;
  }, 100);
}

function clearErrorMessage() {
  const messageDiv = document.querySelector(".message");
  if (messageDiv) {
    messageDiv.style.opacity = 0;
    setTimeout(() => messageDiv.remove(), 500);
  }
}

function showLoading(isLoading) {
  loadingSpinner.classList.toggle("visible", isLoading);
}

function truncate(text, length = 50) {
  return text.length > length ? `${text.slice(0, length)}...` : text;
}
