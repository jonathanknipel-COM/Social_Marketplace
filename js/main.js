document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
    
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

// פונקציית Fetch אסינכרונית לטעינת מוצרים מה-API של השרת שלכם
async function loadProducts(queryString = '') {
    const productsGrid = document.getElementById("products-grid");
    if (!productsGrid) return;

    try {
        productsGrid.innerHTML = "<p>טוען מוצרים...</p>";
        
        // פנייה אסינכרונית לשרת ה-Express שלכם
        const response = await fetch(`/api/products?${queryString}`);
        const products = await response.json();

        productsGrid.innerHTML = "";
        if (products.length === 0) {
            productsGrid.innerHTML = "<p>לא נמצאו מוצרים העונים על דרישות הסינון.</p>";
            return;
        }

        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${product.imagePath || 'assets/default.jpg'}" alt="${product.title}">
                <h3>${product.title}</h3>
                <p>${product.description}</p>
                <span class="badge ${product.status}">${product.status === 'available' ? 'זמין למסירה' : 'הוזמן'}</span>
                <button class="btn" onclick="viewProduct('${product._id}')">לפרטים מלאים</button>
            `;
            productsGrid.appendChild(card);
        });
    } catch (error) {
        console.error("שגיאה בטעינת המוצרים:", error);
        productsGrid.innerHTML = "<p>שגיאה בתקשורת עם השרת בהבאת הנתונים.</p>";
    }
}

// מעבר דינמי לעמוד המוצר המורחב
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// אינטגרציה בסיסית למפה עבור דף המוצר (יופעל ב-product.html)
function initProductMap(lat, lng) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // דוגמה להטמעת מפה דינמית (כאן באמצעות Google Maps API)
    // הערה: יש לוודא שהזרקתם את ה-Script של גוגל עם ה-API-key שלכם
    const position = { lat: parseFloat(lat), lng: parseFloat(lng) };
    const map = new google.maps.Map(mapContainer, {
        zoom: 15,
        center: position,
    });
    const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: "מיקום איסוף המוצר"
    });
}