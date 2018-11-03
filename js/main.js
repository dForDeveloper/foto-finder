let photosArray = [];

function get(elem) {
  return document.querySelector(elem);
}

get('.add-to-album').addEventListener('click', (event) => {
  event.preventDefault();
  let file = get('#choose-file').files[0];
  let url = URL.createObjectURL(file);
  let elem = get('.photo-container-0');
  elem.style.backgroundImage = `url(${url})`;
});