// popup.js
document.getElementById('optionsIcon').addEventListener('click', function() {
    chrome.runtime.openOptionsPage();
});

function searchGoogle() {
    const query = document.getElementById('searchQuery').value;

    logSearch(query);

    // Ayarları al
    chrome.storage.sync.get(['siteLinks', 'incognitoMode'], function(result) {
        const siteLinks = result.siteLinks || [];
        const incognitoMode = result.incognitoMode || false;

        if (siteLinks.length > 0) {
            const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)} site:${siteLinks.join(' OR site:')}`;

            if (incognitoMode) {
                // Open in incognito mode
                chrome.windows.create({ url: searchUrl, incognito: true }, function() {
                    // Reset searchInProgress when the window creation is completed
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError);
                        alert('incognito window not opened.');
                        searchInProgress = false;
                    }
                });
            } else {
                // Check if there is any active Chrome window
                chrome.windows.getCurrent({}, function(currentWindow) {
                    if (currentWindow) {
                        // Open in the current Chrome window
                        chrome.tabs.create({ url: searchUrl, windowId: currentWindow.id }, function() {
                            // Reset searchInProgress when the tab creation is completed
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                alert('incognito window not opened.');
                                searchInProgress = false;
                            }
                        });
                    } else {
                        // If no active window, open in a new window
                        chrome.windows.create({ url: searchUrl }, function() {
                            // Reset searchInProgress when the window creation is completed
                            if (chrome.runtime.lastError) {
                                console.error(chrome.runtime.lastError);
                                alert('incognito window not opened.');
                                searchInProgress = false;
                            }
                        });
                    }
                });
            }
        } else {
            alert('Please set the websites for search.');
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchQuery');
    searchInput.focus(); // Input alanını aktif hale getir

    // Enter tuşuna basıldığında arama yap
    searchInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            searchGoogle();
        }
    });

    // Search düğmesine tıklandığında arama yap
    document.getElementById('searchButton').addEventListener('click', function() {
        searchGoogle();
    });
});


function logSearch(query) {
    chrome.storage.sync.get(['searchHistory'], function(result) {
        const searchHistory = result.searchHistory || [];
        const timestamp = new Date().toLocaleString();
        const searchItem = { query, timestamp };
        searchHistory.push(searchItem);
        chrome.storage.sync.set({ searchHistory: searchHistory }, function() {
            console.log('Arama kaydedildi:', searchItem);
        });
    });
}