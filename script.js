const product = 'computador';
const cartItemsList = document.querySelector('.cart__items');
const API_URL = `https://api.mercadolibre.com/sites/MLB/search?q=$${product}`;
const priceOfCart = document.querySelector('.total-price');

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';
  
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));
  
  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function saveCart() {
  const allCartItems = cartItemsList.innerHTML;
  localStorage.setItem('savedCart', allCartItems);
}

// Recupera a lista salva
function recoverSavedCart() {
  cartItemsList.innerHTML = localStorage.getItem('savedCart');
}

function cartItemClickListener(event) {
  // coloque seu código aqui
  const cartClickedItem = event.target;
  cartItemsList.removeChild(cartClickedItem);
  const wordsOfRemovedItem = cartClickedItem.innerText.split(' ');
  const priceOfRemovedItemStr = wordsOfRemovedItem.find((word) => word.includes('$'));
  const priceOfRemovedItem = parseFloat(priceOfRemovedItemStr.substring(1));
  if (priceOfCart.innerText) {
    const newPrice = (parseFloat(priceOfCart.innerText)).toFixed(2) - priceOfRemovedItem;
    priceOfCart.innerText = newPrice;
  } else {
    priceOfCart.innerText = 0;
  }
  console.log(priceOfCart.innerText);
  saveCart();
}

function createCartItemElement({ id: sku, title: name, price: salePrice } = {}) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  const priceOfAddedItem = salePrice;
  if (priceOfCart.innerText) {
    const newPrice = parseFloat(priceOfCart.innerText) + priceOfAddedItem;
    priceOfCart.innerText = newPrice;
  } else {
    priceOfCart.innerText = 0;
  }
  console.log(priceOfCart.innerText);
  return li;
}

function AddChosenItemToCart() {
  const buttonsAddToCarT = Array.from(document.querySelectorAll('.item__add'));
  buttonsAddToCarT.forEach((button) => button.addEventListener('click', (event) => {
    const clickedButton = event.target;
    const selectedItem = clickedButton.parentElement;
    const selectedItemId = getSkuFromProductItem(selectedItem);
    fetch(`https://api.mercadolibre.com/items/${selectedItemId}`)
    .then((response) => response.json())
    .then((transformedObject) => cartItemsList
    .appendChild(createCartItemElement(transformedObject)))
    .then(() => saveCart());
  }));
}

const emptyCart = () => {
  const emptyCartButton = document.querySelector('.empty-cart');
  emptyCartButton.addEventListener('click', () => {
    cartItemsList.innerHTML = '';
    saveCart();
  });
};

const signalLoading = () => {
  const signal = document.createElement('p');
  signal.className = 'loading';
  signal.innerText = 'loading...';
};

const takeOffSignalLoading = () => {
  const loadingElement = document.querySelector('.loading');
  loadingElement.remove();
};

async function createItemsList() {
  return fetch(API_URL)
  .then((response) => response.json())
  .then((transformedObject) => transformedObject.results);
}

async function displayItemsOnScreen() {
  const itemsSection = document.querySelector('.items');
  signalLoading();
  const itemsList = await createItemsList()
  .catch((error) => error);
  takeOffSignalLoading();
  console.log(itemsList);
  itemsList.forEach((item) => {
    const itemSection = createProductItemElement(item);
    itemsSection.appendChild(itemSection);
  });
  AddChosenItemToCart();
}

window.onload = () => {
  createCartItemElement();
  createItemsList();
  displayItemsOnScreen();
  recoverSavedCart();
  emptyCart();
};