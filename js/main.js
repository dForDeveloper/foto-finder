let photosArray = [];
const reader = new FileReader();

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
    indicationToAddPhotos();
  }
  get('.add-to-album').disabled = true;
};

get('.add-to-album').addEventListener('click', (event) => {
  event.preventDefault();
  reader.readAsDataURL(get('#choose-file').files[0]);
  reader.onload = (event) => makeNewPhoto(event);
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

get('form').addEventListener('input', checkForm);

get('.more-less-container').addEventListener('click', (event) => {
  event.preventDefault();
  const viewedArray = determineViewedArray();
  if (event.target.classList.contains('more-button')) {
    showMore(event, viewedArray);
  } else if (event.target.classList.contains('less-button')) {
    showTen(viewedArray);
  }
});

get('.photo-area').addEventListener('change', (event) => {
  const id = event.target.closest('.photo-card').dataset.id;
  const index = getIndex(event);
  reader.readAsDataURL(get(`#edit-file-${id}`).files[0]);
  reader.onload = (event) => {
    editPhoto(event, index, id);
  }
});

get('.photo-area').addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    deletePhotoCard(event);
  } else if (event.target.classList.contains('favorite-button')) {
    favoritePhotoCard(event);
  }
});

get('.photo-area').addEventListener('focusin', (event) => {
  if (event.target.closest('.photo-card') !== null &&
    !event.target.classList.contains('delete-button')) {
    event.target.onblur = (event) => saveEdits(event);
  }
});

get('.photo-area').addEventListener('keydown', (event) => {
  if(event.key === 'Enter') {
    event.target.blur();
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

function addToDOM(photo, isAnimated) {
  const newCard = document.createElement('article');
  newCard.dataset.id = photo.id;
  newCard.classList.add('photo-card');
  isAnimated && newCard.classList.add('appear');
  newCard.innerHTML = `
    <h4 class="photo-title" contenteditable="true">${photo.title}</h4>
    <label for="edit-file-${photo.id}"
      class="photo-image-${photo.id} photo-container"></label>
    <input type="file" id="edit-file-${photo.id}" accept="image/*">
    <p class="photo-caption" contenteditable="true">${photo.caption}</p>
    <footer class="photo-card-footer">
      <button class="delete-button"></button>
      <button class="favorite-button favorite-${photo.favorite}"></button>
    </footer>`;
  get('.photo-area').prepend(newCard);
  get(`.photo-image-${photo.id}`).style.backgroundImage = `url(${photo.file})`;
}

function animateFavoriteCard(card, photo) {
  if (photo.favorite === true) {
    card.classList.add('glow')
  } else {
    card.classList.remove('appear');
    card.classList.remove('glow');
  }
}

function animateHeart(heart, photo) {
  if (photo.favorite === true) {
    heart.classList.add('throb');
  } else {
    heart.classList.remove('throb');
  }
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
      get('.indication').classList.add('disappear');
      setTimeout(() => get('.indication').remove(), 500);
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
  event.target.closest('.photo-card').classList.add('disappear');
  setTimeout(() => event.target.closest('.photo-card').remove(), 500);
  photosArray.length === 0 && setTimeout(() => indicationToAddPhotos(), 600);
  updateFavoriteCounter();
}

function determineViewedArray() {
  if (get('.favorites') === null) {
    return photosArray.filter(photo => photo.favorite === true);
  }
  return photosArray;
}

function editPhoto(event, index, id) {
  const newFile = event.target.result;
  photosArray[index].updateImage(photosArray, index, newFile);
  get(`.photo-image-${id}`).style.backgroundImage = `url(${newFile})`;
}

function favoritePhotoCard(event) {
  const index = getIndex(event);
  photosArray[index].favorite = !photosArray[index].favorite;
  event.target.classList.replace(`favorite-${!photosArray[index].favorite}`,
    `favorite-${photosArray[index].favorite}`);
  animateFavoriteCard(event.target.closest('.photo-card'), photosArray[index]);
  animateHeart(event.target, photosArray[index]);
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

function indicationToAddPhotos() {
  const newCard = document.createElement('article');
  newCard.classList.add('indication');
  newCard.classList.add('photo-card');
  newCard.innerHTML =
   `<h4 class="photo-title">Add Your Own Photos</h4>
    <figure class="placeholder-image photo-container"></figure>
    <p class="photo-caption">
      add your own photo to the album to remove this placeholder
    </p>
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
  addToDOM(photo, true);
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
}

function searchCards(viewedArray, searchedTerm) {
  removeCardsFromDOM();
  viewedArray.forEach(photo => addToDOM(photo));
  document.querySelectorAll('.photo-card').forEach(card => {
    if (!card.innerText.toLowerCase().includes(searchedTerm.toLowerCase())) {
      card.remove();
    }
  });
  get('.more-less-container').innerHTML = '';
  searchedTerm === '' && showTen(viewedArray);
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