let photosArray = [];

function generateCards() {
  for (var i = 0; i < 30; i++) {
    var testPhoto = new Photo(i, `Title ${i}`, `Caption ${i}`,
      'https://proxy.duckduckgo.com/iu/?u=http%3A%2F%2Ffc00.deviantart.net%2Ffs70%2Ff%2F2011%2F003%2F4%2Fc%2F4_bit_grayscale_palette_by_10binary-d36dso3.png&f=1', i % 2 === 0);
    photosArray.push(testPhoto);
  }
  testPhoto.saveToStorage(photosArray);
}

window.onload = () => {
  if (localStorage.getItem('photos') !== null &&
      localStorage.getItem('photos') !== '[]') {
    loadLocalStorage();
  } else {
    giveIndicationToAddPhotos();
  }
  get('.add-to-album').disabled = true;
};

get('.add-to-album').addEventListener('click', (event) => {
  event.preventDefault();
  const reader = new FileReader();
  reader.readAsDataURL(get('#choose-file').files[0]);
  reader.onload = makeNewPhoto;
});

get('.fav-and-add').addEventListener('click', (event) => {
  event.preventDefault();
  if (event.target.classList.contains('favorites')) {
    showFavorites(event);
  } else if (event.target.classList.contains('view-all')) {
    showTen(photosArray);
    event.target.innerHTML = 'View <span class="num-favs">0</span> Favorites';
    event.target.classList.replace('view-all', 'favorites');
    updateFavoriteCounter();
  }
});

get('form').addEventListener('change', checkForm);

get('.more-less-container').addEventListener('click', (event) => {
  event.preventDefault();
  const viewedArray = determineViewedArray();
  if (event.target.classList.contains('more-button')) {
    showMore(event, viewedArray);
  } else if (event.target.classList.contains('less-button')) {
    showTen(viewedArray);
  }
});

get('.photo-area').addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    deletePhotoCard(event);
  }
  if (event.target.classList.contains('favorite-button')) {
    favoritePhotoCard(event);
    }
  if (event.target.closest('.photo-card') !== null) {
    event.target.onblur = event => saveEdits(event);
  }
});

get('.photo-area').addEventListener('keydown', (event) => {
  if(event.key === 'Enter' || event.key === 'Tab' &&
    event.target.closest('.photo-card') !== null) {
    saveEdits(event);
  }
});

get('#search').addEventListener('keyup', (event) => {
  const viewedArray = determineViewedArray();
  searchCards(viewedArray, event.target.value);
});

get('.search-button').addEventListener('click', (event) => {
  const viewedArray = determineViewedArray();
  searchCards(viewedArray, get('#search').value);
});

function addToDOM(photo) {
  const newCard = document.createElement('article');
  newCard.dataset.id = photo.id;
  newCard.classList.add('photo-card');
  newCard.innerHTML =
   `<h4 class="photo-title" contenteditable="true">${photo.title}</h4>
    <figure class="photo-image-${photo.id} photo-container"></figure>
    <p class="photo-caption" contenteditable="true">${photo.caption}</p>
    <footer class="photo-card-footer">
      <button class="delete-button"></button>
      <button class="favorite-button favorite-${photo.favorite}"></button>
    </footer>`;
  get('.photo-area').prepend(newCard);
  get(`.photo-image-${photo.id}`).style.backgroundImage = `url(${photo.file})`;
}

function checkForm() {
  if (get('#title').value !== '' && get('#caption').value !== '' &&
    get('#choose-file').files.length > 0) {
    get('.add-to-album').disabled = false;
  } else {
    get('.add-to-album').disabled = true;
  }
}

function checkNumCardsDisplayed() {
  if (document.querySelectorAll('.photo-card').length === 10) {
    document.querySelectorAll('.photo-card')[9].remove();
    makeShowMoreButton(true);
  } else if (get('.indication') !== null) {
      get('.indication').remove();
  }
}

function clearInput() {
  get('#title').value = '';
  get('#caption').value = '';
  get('#choose-file').value = '';
  get('.add-to-album').disabled = true;
}

function deletePhotoCard(event) {
  const index = getIndex(event);
  photosArray[index].deleteFromStorage(photosArray, index);
  event.target.closest('.photo-card').remove();
  if (photosArray.length === 0) {
    giveIndicationToAddPhotos();
  }
  updateFavoriteCounter();
}

function determineViewedArray() {
  if (get('.favorites') === null) {
    return photosArray.filter(photo => photo.favorite === true);
  }
  return photosArray;
}

function favoritePhotoCard(event) {
  const index = getIndex(event);
  const newFavStatus = !photosArray[index].favorite
  photosArray[index].favorite = newFavStatus;
  event.target.classList.replace(`favorite-${!newFavStatus}`,
    `favorite-${newFavStatus}`);
  updateFavoriteCounter();
  saveEdits(event);
}

function get(elem) {
  return document.querySelector(elem);
}

function getIndex(event) {
  const id = parseInt(event.target.closest('.photo-card').dataset.id);
  return photosArray.findIndex(photo => photo.id === parseInt(id));
}
  
function getNextID() {
  if (photosArray[0] !== undefined) {
    return photosArray[photosArray.length - 1].id + 1;
  }
  return 0;
}

function giveIndicationToAddPhotos() {
  const newCard = document.createElement('article');
  newCard.classList.add('indication');
  newCard.classList.add('photo-card');
  newCard.innerHTML =
   `<h4 class="photo-title">Add Your Own Photos</h4>
    <figure class="placeholder-image photo-container"></figure>
    <p class="photo-caption">add your own photo to the album to remove this placeholder</p>
    <footer class="photo-card-footer">
      <button class="fake-delete"></button>
      <button class="fake-favorite"></button>
    </footer>`;
  get('.photo-area').prepend(newCard);
  get('.fake-delete').disabled = true;
  get('.fake-favorite').disabled = true;
}

function loadLocalStorage() {
  photosArray = JSON.parse(localStorage.getItem('photos'));
  photosArray.forEach(photo => addToDOM(photo));
  photosArray = photosArray.map(photo => {
    return photo = new Photo(photo.id, photo.title, photo.caption, photo.file,
      photo.favorite);
  });
  showTen(photosArray);
  updateFavoriteCounter();
}

function makeNewPhoto(event) {
  const id = getNextID();
  const title = get('#title').value;
  const caption = get('#caption').value;
  const file = event.target.result;
  const photo = new Photo(id, title, caption, file);
  photo.saveToStorage(photosArray, true);
  clearInput();
  checkNumCardsDisplayed();
  addToDOM(photo);
}

function makeShowMoreButton(moreExist) {
  get('.more-less-container').innerHTML = '';
  if (moreExist) {
    const button = document.createElement('button');
    button.classList.add('more-button');
    button.innerText = 'Show More';
    get('.more-less-container').append(button);
  }
}

function removeCardsFromDOM() {
  get('.photo-area').innerHTML = '';
}

function saveEdits(event) {
  const index = getIndex(event);
  const id = photosArray[index].id;
  const title = get(`.photo-card[data-id="${id}"] .photo-title`).innerText;
  const caption = get(`.photo-card[data-id="${id}"] .photo-caption`).innerText;
  photosArray[index].updatePhoto(photosArray, index, title, caption);
  event.target.blur();
}

function searchCards(viewedArray, searchedTerm) {
  removeCardsFromDOM();
  viewedArray.forEach(photo => addToDOM(photo));
  document.querySelectorAll('.photo-card').forEach(card => {
    if (!card.innerText.includes(searchedTerm)) {
      card.remove();
    }
  });
  searchedTerm === '' && showTen(viewedArray);
  get('.more-less-container').innerHTML = '';
}

function showFavorites(event) {
  removeCardsFromDOM();
  const favorites = photosArray.filter(photo => photo.favorite === true);
  showTen(favorites);
  event.target.innerHTML = 'View All Photos';
  event.target.classList.replace('favorites', 'view-all');
}

function showMore(event, viewedArray) {
  removeCardsFromDOM();
  viewedArray.forEach(photo => addToDOM(photo));
  event.target.innerText = 'Show Less';
  event.target.classList.replace('more-button', 'less-button');
}

function showTen(viewedArray) {
  removeCardsFromDOM();
  const tenMostRecent = viewedArray.filter((photo, index) => {
    return index >= viewedArray.length - 10;
  })
  tenMostRecent.forEach(photo => addToDOM(photo));
  makeShowMoreButton(viewedArray.length > 10);
}

function updateFavoriteCounter() {
  const favCount = photosArray.filter(photo => photo.favorite === true).length;
  if (get('.num-favs') !== null) {
    get('.num-favs').innerText = favCount;
  }
}