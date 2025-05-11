// setup de la aplicacion
var catalog = [];
var items = [];
var filter = "all";

// llamar elementos del DOM
const overlay = document.querySelector("#overlay");
const btnMenu = document.querySelector("#btnMenu");
const menu = document.querySelector("#menu");
const btnCart = document.querySelector("#btnCart");
const carrito = document.querySelector("#carrito");
const btnCloseCart = document.querySelector("#btnCloseCart");
const btnClearCart = document.querySelector("#btnClearCart");
const itemsCart = document.querySelector("#items");
const subtotal = document.querySelector("#subtotal");
const envio = document.querySelector("#envio");
const total = document.querySelector("#total");

//////////////////////

const categories = document.querySelectorAll("input[name='category']");
const products = document.querySelector("#catalogo");

/////////////////////

const contactForm = document.querySelector("#contact-form");
const inputName = document.querySelector("#name");
const inputMail = document.querySelector("#email");
const textMessage = document.querySelector("#message");
const feedbackName = document.querySelector("#feedback_name");
const feedbackEmail = document.querySelector("#feedback_email");

// Producto

const getData = async () => {
  let response = await fetch("/data.json");
  let data = await response.json();
  console.log(data);
  catalog = data;
  console.log(catalog);

  return catalog;
};

const renderData = () => {
  products.innerHTML = null;
  let productos = catalog;
  if (filter != "all") {
    productos = productos.filter((product) => product.categoria == filter);
  }
  productos.forEach((product) => {
    products.append(card(product));
  });
};

const card = (producto) => {
  let { nombre, id, categoria, precio, descripcion, imagen } = producto;
  const moneda = new Intl.NumberFormat("es-ar", {
    style: "currency",
    currency: "ARS",
  }).format(precio);
  let template = `<picture><img src="${imagen}" alt=""/></picture>
                  <dl>
                    <dt>${nombre}</dt>
                    <dd>${descripcion} </dd>
                    </dl>
                    <p>${moneda} </p>`;
  let card = document.createElement("li");
  card.setAttribute("data-category", categoria);
  card.setAttribute("data-id", id);
  card.innerHTML = template;
  const cardForm = document.createElement("form");
  const btnAddCart = document.createElement("button");
  btnAddCart.setAttribute("type", "button");
  btnAddCart.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shopping-cart-icon lucide-shopping-cart"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`;

  // Agregar al carrito
  btnAddCart.addEventListener("click", addItemCart);

  cardForm.append(btnAddCart);
  card.append(cardForm);
  return card;
};

// Carrito
const showCart = (e) => {
  carrito.classList.add("active");
  overlay.classList.add("active");
};

const closeCart = (e) => {
  carrito.classList.remove("active");
  overlay.classList.remove("active");
};

const closeCartBodyClick = () => {
  if (carrito.classList.contains("active")) return closeCart();
};

const renderCart = () => {
  // Traer el carrito del localStorage
  let cart = JSON.parse(localStorage.getItem("carrito"));
  items = cart || [];
  // Por cada elemento del cart agregar un item al carrito
  itemsCart.innerHTML = null;
  subtotal.innerHTML = null;
  envio.innerHTML = null;
  total.innerHTML = null;
  const moneda = new Intl.NumberFormat("es-ar", {
    style: "currency",
    currency: "ARS",
  });

  let valueSubtotal = items.reduce((valorPrevio, itemActual) => {
    return (valorPrevio += itemActual.precio * itemActual.cantidad);
  }, 0);
  let valueShipping = valueSubtotal < 200000 ? valueSubtotal * 0.2 : 0;

  subtotal.innerHTML = moneda.format(valueSubtotal);
  if (valueShipping != 0) {
    envio.innerHTML = moneda.format(valueShipping);
  } else {
    envio.innerHTML = "Free";
  }
  total.innerHTML = moneda.format(valueShipping + valueSubtotal);

  items.forEach((itemCart) => itemsCart.append(item(itemCart)));
};

const item = (itemCart) => {
  const { cantidad, precio, nombre, imagen, id } = itemCart;
  let cardItem = document.createElement("li");
  cardItem.setAttribute("data-id", id);
  const moneda = new Intl.NumberFormat("es-ar", {
    style: "currency",
    currency: "ARS",
  });
  let templateItem = `<picture>
                        <img src="${imagen}" alt="">
                    </picture>
                    
                    <dl>
                        <dt>${nombre}</dt>
                        <dd>${moneda.format(precio * cantidad)}</dd>
                    </dl>`;

  cardItem.innerHTML = templateItem;
  let formItem = document.createElement("form");
  let btnAddItemCart = document.createElement("button");
  btnAddItemCart.setAttribute("type", "button");
  btnAddItemCart.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus-icon lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
  btnAddItemCart.addEventListener("click", addItemCart);
  let outputQuantityItem = document.createElement("output");
  outputQuantityItem.innerHTML = `${cantidad}`;
  let btnRemoveItemCart = document.createElement("button");
  btnRemoveItemCart.setAttribute("type", "button");
  btnRemoveItemCart.innerHTML = ` <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus-icon lucide-minus"><path d="M5 12h14"/></svg>`;
  btnRemoveItemCart.addEventListener("click", removeItemCart);
  formItem.append(btnRemoveItemCart, outputQuantityItem, btnAddItemCart);
  cardItem.append(formItem);
  return cardItem;
};

const addItemCart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  debugger;
  let producto = e.target.closest("li");
  let id = Number(producto.dataset.id);
  // Buscar al producto dentro del catalogo
  let productoEncontrado = catalog.find((p) => p.id == id);
  // Verificar si no hay items en el carrito
  if (items.length == 0) {
    items.push({ ...productoEncontrado, cantidad: 1 });
    localStorage.setItem("carrito", JSON.stringify(items));
    return renderCart();
  }
  // Verificar si el producto encontrado no esta en los items
  if (items.filter((item) => productoEncontrado.id == item.id).length == 0) {
    items.push({ ...productoEncontrado, cantidad: 1 });
    localStorage.setItem("carrito", JSON.stringify(items));
    return renderCart();
  }
  items = items.map((item) => {
    if (item.id == productoEncontrado.id) {
      item.cantidad += 1;
    }
    return item;
  });
  localStorage.setItem("carrito", JSON.stringify(items));
  return renderCart();
};

const removeItemCart = (e) => {
  e.preventDefault();
  e.stopPropagation();
  debugger;
  let producto = e.target.closest("li");
  let id = Number(producto.dataset.id);
  // Buscar al producto dentro del catalogo
  let productoEncontrado = catalog.find((p) => p.id == id);
  // Actualizar la cantidad del item que sea igual id del producto encontrado
  items = items.map((item) => {
    if (item.id == productoEncontrado.id) {
      item.cantidad -= 1;
    }
    return item;
  });
  // Filtrar los items del carrito cuya cantidad sean mayor a cero
  items = items.filter((item) => item.cantidad > 0);
  localStorage.setItem("carrito", JSON.stringify(items));
  return renderCart();
};

const clearCart = (e) => {
  e.preventDefault();
  items = [];
  localStorage.setItem("carrito", JSON.stringify(items));
  renderCart();
};

// filtros

const selectCategory = (e) => {
  filter = e.target.value;
  renderData();
};

// Contacto

const sendContact = (e) => {
  e.preventDefault();
  let errores = [];
  let expresion =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (inputName.value.trim().length < 2) {
    feedbackName.classList.remove("error");
    feedbackName.classList.remove("success");
    feedbackName.classList.add("error");
    feedbackName.innerHTML = "Debe colocar mas de dos caracteres.";
    errores.push("name");
  } else {
    feedbackName.classList.remove("error");
    feedbackName.classList.remove("success");
    feedbackName.classList.add("success");
    feedbackName.innerHTML = "Nombre completado con exito";
  }
  if (!expresion.test(inputMail.value.trim().toLowerCase())) {
    feedbackEmail.classList.remove("error");
    feedbackEmail.classList.remove("success");
    feedbackEmail.classList.add("error");
    feedbackEmail.innerHTML = "No es un formato de correo valido.";
    errores.push("email");
  } else {
    feedbackName.classList.remove("error");
    feedbackName.classList.remove("success");
    feedbackName.classList.add("success");
    feedbackName.innerHTML = "Correo valido.";
  }
  if (textMessage.value.trim().length < 10) {
    feedbackMessage.classList.remove("error");
    feedbackMessage.classList.remove("success");
    feedbackMessage.classList.add("error");
    feedbackMessage.innerHTML = "Minimo 10 caracteres.";
    errores.push("message");
  } else if (textMessage.value.trim().length > 100) {
    feedbackMessage.classList.remove("error");
    feedbackMessage.classList.remove("success");
    feedbackMessage.classList.add("error");
    feedbackMessage.innerHTML = "Demasiados caracteres.";
    errores.push("message");
  } else {
    feedbackMessage.classList.remove("error");
    feedbackMessage.classList.remove("success");
    feedbackMessage.classList.add("success");
    feedbackMessage.innerHTML = "Mensaje correcto.";
  }

  if (errores.length == 0) {
    let enviar = confirm("Deseas enviar tu mensaje?");
    if (enviar) {
      alert("Mensaje enviado");
      contactForm.reset();
      feedbackName.innerHTML = "";
      feedbackEmail.innerHTML = "";
      feedbackMessage.innerHTML = "";
    }
  }
};

//validamos mientras el usuario va escribiendo
const validateName = () => {
  if (inputName.value.trim().length < 2) {
    feedbackName.classList.remove("error");
    feedbackName.classList.remove("success");
    feedbackName.classList.add("error");
    feedbackName.innerHTML = "Debe colocar mas de dos caracteres.";
  } else {
    feedbackName.classList.remove("error");
    feedbackName.classList.remove("success");
    feedbackName.classList.add("success");
    feedbackName.innerHTML = "Nombre completado con exito";
  }
};

const validateEmail = () => {
  let expresion =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
  if (!expresion.test(inputMail.value.trim().toLowerCase())) {
    feedbackEmail.classList.remove("error");
    feedbackEmail.classList.remove("success");
    feedbackEmail.classList.add("error");
    feedbackEmail.innerHTML = "No es un formato de correo valido.";
  } else {
    feedbackName.classList.remove("error");
    feedbackName.classList.remove("success");
    feedbackName.classList.add("success");
    feedbackName.innerHTML = "Correo valido.";
  }
};

const validateMessage = () => {
  if (textMessage.value.trim().length < 10) {
    feedbackMessage.classList.remove("error");
    feedbackMessage.classList.remove("success");
    feedbackMessage.classList.add("error");
    feedbackMessage.innerHTML = "Minimo 10 caracteres.";
    errores.push("message");
  } else if (textMessage.value.trim().length > 100) {
    feedbackMessage.classList.remove("error");
    feedbackMessage.classList.remove("success");
    feedbackMessage.classList.add("error");
    feedbackMessage.innerHTML = "Demasiados caracteres.";
    errores.push("message");
  } else {
    feedbackMessage.classList.remove("error");
    feedbackMessage.classList.remove("success");
    feedbackMessage.classList.add("success");
    feedbackMessage.innerHTML = "Mensaje correcto.";
  }
};

const init = async () => {
  // Carrito Acciones
  btnCart.addEventListener("click", showCart);
  btnCloseCart.addEventListener("click", closeCart);
  overlay.addEventListener("click", closeCartBodyClick);
  btnClearCart.addEventListener("click", clearCart);
  renderCart();

  // Producto Acciones
  await getData();
  renderData();
  //filtros
  for (const category of categories) {
    category.addEventListener("change", selectCategory);
  }
  // Contacto
  contactForm.addEventListener("submit", sendContact);
  inputName.addEventListener("keydown", validateName);
  inputMail.addEventListener("keydown", validateEmail);
  textMessage.addEventListener("keydown", validateMessage);
  contactForm.reset();
};

init();
