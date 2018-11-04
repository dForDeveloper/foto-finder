let photosArray = [];

function get(elem) {
  return document.querySelector(elem);
}

window.onload = () => {
  if (localStorage.getItem('photos') !== null) {
    loadLocalStorage();
  }
  get('.add-to-album').disabled = true;
}

get('form').addEventListener('change', checkForm);

get('.add-to-album').addEventListener('click', (event) => {
  event.preventDefault();
  const id = getNextID();
  const title = get('#title').value;
  const caption = get('#caption').value;
  const file = URL.createObjectURL(get('#choose-file').files[0]);
  const photo = new Photo(id, title, caption, file);
  photo.saveToStorage(photosArray, true);
  clearInput();
  addToDOM(photo);
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

function checkForm() {
  if (get('#title').value !== '' && get('#caption').value !== '' &&
    get('#choose-file').files.length > 0) {
    get('.add-to-album').disabled = false;
  } else {
    get('.add-to-album').disabled = true;
  }
}

function clearInput() {
  get('#title').value = '';
  get('#caption').value = '';
  get('#choose-file').value = '';
  get('.add-to-album').disabled = true;
}

function saveEdits(event) {
  const index = getIndex(event);
  const id = photosArray[index].id;
  const title = get(`.photo-card[data-id="${id}"] .photo-title`).innerText;
  const caption = get(`.photo-card[data-id="${id}"] .photo-caption`).innerText;
  photosArray[index].updatePhoto(photosArray, index, title, caption);
  event.target.blur();
}

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
  const index = getIndex(event);
  photosArray[index].deleteFromStorage(photosArray, index);
  event.target.closest('.photo-card').remove();
}

function favoritePhotoCard(event) {
  const index = getIndex(event);
  const newFavStatus = !photosArray[index].favorite
  photosArray[index].favorite = newFavStatus;
  event.target.classList.replace(`favorite-${!newFavStatus}`,
    `favorite-${newFavStatus}`);
  saveEdits(event);
}

function getIndex(event) {
  const id = parseInt(event.target.closest('.photo-card').dataset.id);
  return photosArray.findIndex(photo => photo.id === parseInt(id));
}