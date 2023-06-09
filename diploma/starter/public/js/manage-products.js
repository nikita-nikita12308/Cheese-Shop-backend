async function getProducts(page) {
  try {
    const response = await axios.get(`http://127.0.0.1:8000/api/v1/products?limit=3&fields=name,imageCover&page=${page}&sort=name`);
    const products = response.data.data.data;
    console.log(products);

    const productContainer = document.getElementById('product-container');
    productContainer.innerHTML = ''; // Clear the container before updating

    // Update the products in the template
    products.forEach(product => {
      const card = document.createElement('div');
      card.classList.add('card-admin');

      const cardHeader = document.createElement('div');
      cardHeader.classList.add('card__header');

      const cardPicture = document.createElement('div');
      cardPicture.classList.add('card__picture-admin');

      const cardPictureOverlay = document.createElement('div');
      cardPictureOverlay.classList.add('card__picture-overlay-admin');
      cardPictureOverlay.innerHTML = '&nbsp;';

      const image = document.createElement('img');
      image.classList.add('card__picture-img-admin');
      image.src = `/img/products/${product.imageCover}`;
      image.alt = product.name;

      const heading = document.createElement('h3');
      heading.classList.add('heading-tertirary');
      heading.innerText = product.name;

      cardPicture.appendChild(cardPictureOverlay);
      cardPicture.appendChild(image);
      cardHeader.appendChild(cardPicture);
      cardHeader.appendChild(heading);
      card.appendChild(cardHeader);

      productContainer.appendChild(card);

      const editButton = document.createElement('button');
      editButton.classList.add('btn', 'btn--edit');
      editButton.innerText = 'Змінити продукт';
      editButton.setAttribute('data-product-id', product._id);
      card.appendChild(editButton);

      // Додано обробник події для кнопки "Змінити продукт"
      editButton.addEventListener('click', () => {
        const productId = editButton.getAttribute('data-product-id');
        console.log(`Натиснуто кнопку "Змінити продукт" для продукту з ідентифікатором ${productId}`);
        console.log(`Назва продукту: ${product.name}`);
      });
    });
  } catch (error) {
    console.log(error);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const pageButtons = document.querySelectorAll('.page-button');

  pageButtons.forEach(button => {
    button.addEventListener('click', () => {
      const page = button.dataset.page;
      getProducts(page);
    });
  });
  getProducts(1);
});
