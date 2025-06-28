// Elements
        const comicTitle = document.getElementById('comicTitle');
        const comicImage = document.getElementById('comicImage');
        const comicAlt = document.getElementById('comicAlt');
        const comicNumber = document.getElementById('comicNumber');
        const loadButton = document.getElementById('loadNewComic');
        const loadingSpinner = document.getElementById('loadingSpinner');

        // CORS proxy to avoid cross-origin issues in the webview
        const corsProxy = 'https://api.allorigins.win/raw?url=';

        // Current comic number (for XKCD API)
        let currentComicNumber = null;

        // Hide elements before loading
        function hideElementsBeforeLoad() {
            comicImage.classList.add('hidden');
            comicAlt.classList.add('hidden');
            comicNumber.classList.add('hidden');
        }

        // Load a random XKCD comic
        async function loadRandomComic() {
            try {
                showLoading(true);

                // First fetch the latest comic number
                const latestResponse = await fetch(corsProxy + 'https://xkcd.com/info.0.json');
                const latestData = await latestResponse.json();
                const maxComicNumber = latestData.num;

                // Generate a random comic number between 1 and max
                const randomComicNumber = Math.floor(Math.random() * maxComicNumber) + 1;

                // Fetch the random comic
                const response = await fetch(corsProxy + 'https://xkcd.com/' + randomComicNumber + '/info.0.json');
                const data = await response.json();

                // Display the comic
                displayComic(data);

                // Store the current comic number
                currentComicNumber = data.num;
            } catch (error) {
                console.error('Error loading XKCD comic:', error);
                comicTitle.textContent = 'Error loading comic';
                comicAlt.textContent = 'Failed to load comic. Please try again.';
            } finally {
                showLoading(false);
            }
        }

        // Display a comic from the data
        function displayComic(comicData) {
            comicTitle.textContent = comicData.title;
            comicImage.src = comicData.img;
            comicImage.alt = comicData.alt;
            comicAlt.textContent = comicData.alt;
            comicNumber.textContent = 'Comic #' + comicData.num;

            // Show elements once loaded
            comicImage.classList.remove('hidden');
            comicAlt.classList.remove('hidden');
            comicNumber.classList.remove('hidden');
        }

        // Show or hide loading spinner
        function showLoading(isLoading) {
            if (isLoading) {
                loadingSpinner.style.display = 'block';
                comicTitle.textContent = 'Loading comic...';
                loadButton.disabled = true;
            } else {
                loadingSpinner.style.display = 'none';
                loadButton.disabled = false;
            }
        }

        // Handle errors with the comic image
        comicImage.onerror = function() {
            comicImage.src = '';
            comicImage.alt = 'Failed to load image';
            comicAlt.textContent = 'Image failed to load. This might be due to CORS restrictions. Please try another comic.';
        };

        // Add event listener to the load button
        loadButton.addEventListener('click', () => {
            loadRandomComic();
        });

        // Load a random comic when the page loads
        window.addEventListener('load', () => {
            hideElementsBeforeLoad();
            loadRandomComic();
        });
