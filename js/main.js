async function loadCategories() {
    const response = await fetch(API_BASE_URL + "/api/categories", {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const {categories} = await response.json();
    return categories;
}

// On page load - fetch necessary data
document.addEventListener("DOMContentLoaded", async () => {
    // Load products
    loadProducts();

    // Load categories
    const categories = await loadCategories();
    const filterCategory = document.getElementById("filter-category")
    console.log(categories, filterCategory)
    if (filterCategory) {
        filterCategory.innerHTML = `<option value="">All Categories</option>`
        categories.forEach(category => {
            filterCategory.innerHTML += `<option value="${category._id}">${category.name}</option>`
        })
    }
    
    const filterForm = document.getElementById("advanced-filter-form");
    if (filterForm) {
        filterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const formData = new FormData(filterForm);
            const searchParams = new URLSearchParams(formData);
            loadProducts(searchParams.toString());
        });
    }
});

// Asynchronous Fetch function to load products from your server API
async function loadProducts(queryString = '') {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    try {
        productsGrid.innerHTML = "<p>Loading products...</p>";
        
        // Asynchronous call to your Express server
        const response = await fetch(`${API_BASE_URL}/api/products?${queryString}`);
        const data = await response.json();

        productsGrid.innerHTML = "";
        if (data.products.length === 0) {
            productsGrid.innerHTML = "<p>No products found matching the filter criteria.</p>";
            return;
        }
        console.log(data); // Log the products to the console for debugging
        data.products.forEach(product => {
            const card = document.createElement("div");
            const mediaPath = product.mediaPath || 'assets/default.jpg'
            const isVideo = mediaPath.endsWith('.mp4') || mediaPath.endsWith('.mov')
            console.log({isVideo, mediaPath})

            card.className = "product-card";
            card.style = "margin-bottom: 2rem;";
            card.innerHTML = `
                ${
                    isVideo
                        ? `<video src="${mediaPath}" controls alt="${product.title}" style="width: 100%; height: auto; object-fit: cover;"></video>`
                        : `<img src="${mediaPath}" alt="${product.title}" style="width: 100%; height: auto; object-fit: cover;"/>`
                }
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <span class="badge ${product.status}">${product.status === 'available' ? 'Available for delivery' : 'Requested'}</span>
                <button class="btn" onclick="viewProduct('${product._id}')">Full Details</button>
            `;
            productsGrid.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading products:", error);
        productsGrid.innerHTML = "<p>Error communicating with the server while fetching data.</p>";
    }
}

// Dynamic redirect to the extended product page
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// Basic map integration for the product page (will be executed in product.html)
function initProductMap(lat, lng) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Example of dynamic map implementation (here using Google Maps API)
    // Note: Make sure you have injected the Google script with your API-key
    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const map = new google.maps.Map(mapContainer, {
        zoom: 15,
        center: position,
    });
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: "Product Pickup Location"
    });
}


/**
 * Fetches product data based on ID
 */
async function loadProductDetail(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching product detail:", error);
        throw error;
    }
}