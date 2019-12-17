'use strict';
const menu = document.querySelector(".menu");

document.querySelector("#mobileMenu").addEventListener("click", displayMenu);

function displayMenu() {
    if (menu.style.display === "none") {
        menu.style.display = "flex"; document.querySelector("#mobileMenu").style.background="url('http://petragergely.dk/kea/imgs/delete.png')";
        document.querySelector("#mobileMenu").style.backgroundSize = "cover";
    } else {
        menu.style.display = "none"; document.querySelector("#mobileMenu").style.background="url('http://petragergely.dk/kea/imgs/menu.png')";
    }
}

window.onload = () => {
    if(document.title === 'Store') {
        doGetShopEntries();
    } else if(document.title === 'Cart') {
        doLoadCartProducts();

        document.getElementById('payButton').onclick = (event) => {
            event.preventDefault();

            localStorage.removeItem('CURRENT_ITEMS_IN_BASKET');

            window.location.href = `thankyou.html`;
        }
    }
};

function doGetShopEntries() {
    axios.get('http://karolinavalentova.me/wp/?rest_route=/wp/v2/killfly-store')
        .then(function (response) {
            if(response.status === 200 && response.data.length) {
                doAddEntriesToTheShop(response.data);
            }
        })
        .catch(function (error) {
            console.log(error);
        })
}

function doAddEntriesToTheShop(entries) {
    const container = document.getElementById('productsContainer');
    entries.forEach((entry) => {
        const template = document.getElementById('shopEntry');
        const entryElement = template.content.cloneNode(true);
        const { img, name_item, description, price } = entry;

        entryElement.children[0].children[0].src = img.guid;
        entryElement.children[0].children[1].textContent = name_item;
        entryElement.children[0].children[2].textContent = description;
        entryElement.children[0].children[3].children[0].textContent = `${price}$`;
        entryElement.children[0].children[3].children[1].onclick = () => {
            doAddItemToCart({
                img,
                name_item,
                price
            })
        };

        container.appendChild(entryElement);
    })
}

function doAddItemToCart(item) {
    let currentBasket = localStorage.getItem('CURRENT_ITEMS_IN_BASKET');
    if(currentBasket) {
        currentBasket = JSON.parse(currentBasket);
        currentBasket.push(item);

        localStorage.setItem('CURRENT_ITEMS_IN_BASKET', JSON.stringify(currentBasket));
    } else {
        const newBasket = [];
        newBasket.push(item);
        localStorage.setItem('CURRENT_ITEMS_IN_BASKET', JSON.stringify(newBasket));
    }
}

function doLoadCartProducts() {
    const productTemplate = document.getElementById('productTemplate');
    const productsContainer = document.getElementById('productsContainer');

    let totalProductsPrice = 0;

    let currentBasket = localStorage.getItem('CURRENT_ITEMS_IN_BASKET');
    if(currentBasket) {
        currentBasket = JSON.parse(currentBasket);

        currentBasket.forEach((entry) => {
             const { img, name_item, price } = entry;
             const newProductTemplate = productTemplate.content.cloneNode(true);

             newProductTemplate.children[0].children[0].children[0].src = img.guid;
             newProductTemplate.children[0].children[1].textContent = name_item;
             newProductTemplate.children[0].children[2].textContent = `${price}$`;

             totalProductsPrice += parseFloat(price);

             productsContainer.appendChild(newProductTemplate);
        });

        productsContainer.appendChild(document.createElement('hr'));
        productsContainer.innerHTML += `<h3 class="end">Total: <span id="totalPrice">${totalProductsPrice}</span>$</h3>`

        // document.getElementById('totalPrice').textContent = totalProductsPrice;
    }
}

function doProcessPayment() {

}