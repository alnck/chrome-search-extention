document.addEventListener('DOMContentLoaded', function() {
    displaySavedSites();
    displaySearchHistory(1);
    loadIncognitoSetting();
});

document.getElementById('clearHistoryLink').addEventListener('click', function () {
    chrome.storage.sync.set({ searchHistory: [] }, function () {
      displaySearchHistory();
    });
});

document.getElementById('saveButton').addEventListener('click', function() {
    saveSettings();
});

document.getElementById('incognitoCheckbox').addEventListener('click', function() {
    saveIncognitoSetting(); // Ayarları kaydederken incognito ayarını da kaydet
});

function saveSettings() {
    const siteLinksInput = document.getElementById('siteLinks');
    const newSite = siteLinksInput.value.trim();

    if (newSite !== '') {
        chrome.storage.sync.get(['siteLinks'], function(result) {
            const siteLinks = result.siteLinks || [];
            siteLinks.push(newSite);
            chrome.storage.sync.set({ siteLinks: siteLinks }, function() {
                console.log('Settings saved..:', siteLinks);
                displaySavedSites();
            });
        });

        siteLinksInput.value = '';
    }
}

function removeSite(site) {
    chrome.storage.sync.get(['siteLinks'], function(result) {
        const siteLinks = result.siteLinks || [];
        const updatedSites = siteLinks.filter(s => s !== site);
        chrome.storage.sync.set({ siteLinks: updatedSites }, function() {
            console.log('Site kaldırıldı:', updatedSites);
            displaySavedSites();
        });
    });
}

function displaySavedSites() {
    const savedSitesList = document.getElementById('savedSites');
    savedSitesList.innerHTML = '';

    chrome.storage.sync.get(['siteLinks'], function(result) {
        const siteLinks = result.siteLinks || [];
        siteLinks.forEach(function(site) {
            const listItem = document.createElement('li');
            listItem.textContent = site;

            // Remove düğmesi oluştur
            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function() {
                removeSite(site);
            });

            // Listeye elemanları ekle
            listItem.appendChild(removeButton);
            savedSitesList.appendChild(listItem);
        });
    });
}

function displaySearchHistory(pageNumber) {
    const itemsPerPage = 10;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const searchHistoryList = document.getElementById('searchHistory');
    searchHistoryList.innerHTML = '';

    chrome.storage.sync.get(['searchHistory'], function(result) {
        const searchHistory = result.searchHistory || [];
        const itemsToDisplay = searchHistory.slice(startIndex, endIndex);

        itemsToDisplay.forEach(function(item) {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.query} - ${item.timestamp}`;
            searchHistoryList.appendChild(listItem);
        });

        // Sayfalandırma kontrolleri
        displayPaginationControls(searchHistory.length, itemsPerPage, pageNumber);
    });
}

function displayPaginationControls(totalItems, itemsPerPage, currentPage) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const paginationControls = document.getElementById('paginationControls');
    paginationControls.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', function() {
            displaySearchHistory(i);
        });

        if (i === currentPage) {
            pageButton.classList.add('active');
        }

        paginationControls.appendChild(pageButton);
    }
}


function loadIncognitoSetting() {
    chrome.storage.sync.get(['incognitoMode'], function(result) {
        const incognitoCheckbox = document.getElementById('incognitoCheckbox');
        incognitoCheckbox.checked = result.incognitoMode || false;
    });
}

function saveIncognitoSetting() {
    const incognitoCheckbox = document.getElementById('incognitoCheckbox');
    const incognitoMode = incognitoCheckbox.checked;

    chrome.storage.sync.set({ 'incognitoMode': incognitoMode }, function() {
        console.log('Incognito mode setting saved:', incognitoMode);
    });
}