class Photo {
  constructor(id, title, caption, file, favorite) {
    this.id = id;
    this.title = title;
    this.caption = caption;
    this.file = file;
    this.favorite = favorite || false;
  }

  saveToStorage(photosArray, isNewPhoto) {
    if (isNewPhoto) {
      photosArray.push(this);
    }
    localStorage.setItem('photos', JSON.stringify(photosArray));
  }

  deleteFromStorage(photosArray, index) {
    photosArray.splice(index, 1);
    this.saveToStorage(photosArray);
  }

  updatePhoto(photosArray, index, title, caption) {
    photosArray[index].title = title;
    photosArray[index].caption = caption;
    this.saveToStorage(photosArray);
  }
}