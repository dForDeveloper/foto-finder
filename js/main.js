let photosArray = [];

function get(elem) {
  return document.querySelector(elem);
}

window.onload = () => {
  if (localStorage.getItem('photos') !== null) {
    loadLocalStorage();
  }
}

get('.add-to-album').addEventListener('click', (event) => {
  event.preventDefault();
  const id = getNextID();
  const title = get('#title').value;
  const caption = get('#caption').value;
  const file = URL.createObjectURL(get('#choose-file').files[0]);
  const photo = new Photo(id, title, caption, file);
  photo.saveToStorage(photosArray, true);
  addToDOM(photo);
  // let elem = get('.photo-container-0');
  // elem.style.backgroundImage = `url(${url})`;
});

get('.photo-area').addEventListener('click', (event) => {
  if (event.target.classList.contains('delete-button')) {
    deletePhotoCard(event);
  }
  if (event.target.classList.contains('favorite-button')) {
    favoritePhotoCard(event);
    }
});

function getNextID() {
  if (photosArray[0] !== undefined) {
    return photosArray[photosArray.length - 1].id + 1;
  }
  return 0;
}

function addToDOM(photo) {
  const newCard = document.createElement('article');
  newCard.dataset.id = photo.id;
  newCard.classList.add('photo-card');
  newCard.innerHTML =
   `<h4 class="photo-title">${photo.title}</h4>
    <figure class="photo-image-${photo.id} photo-container"></figure>
    <p class="photo-caption">${photo.caption}</p>
    <footer class="photo-card-footer">
      <button class="delete-button"></button>
      <button class="favorite-button favorite-${photo.favorite}"></button>
    </footer>`;
  get('.photo-area').prepend(newCard);
  get(`.photo-image-${photo.id}`).style.backgroundImage = `url(${photo.file})`;
}

function loadLocalStorage() {
  photosArray = JSON.parse(localStorage.getItem('photos'));
  photosArray = photosArray.map(photo => {
    return photo = new Photo(photo.id, photo.title, photo.caption, photo.file,
      photo.favorite);
  });
  // showTen();
  photosArray.forEach(photo => addToDOM(photo));
}

function deletePhotoCard(event) {
  const id = parseInt(event.target.closest('.photo-card').dataset.id);
  const index = getIndex(id);
  photosArray[index].deleteFromStorage(photosArray, index);
  event.target.closest('.photo-card').remove();
}

function favoritePhotoCard(event) {
  const id = parseInt(event.target.closest('.photo-card').dataset.id);
  const index = getIndex(id);
  const newFavStatus = !photosArray[index].favorite;
  photosArray[index].updateFavorite(photosArray, newFavStatus);
  event.target.classList.replace(`favorite-${!newFavStatus}`,
    `favorite-${newFavStatus}`);
  event.target.blur();
}

function getIndex(id) {
  return photosArray.findIndex(photo => photo.id === id);
}