// Use dynamic hostname so it works locally and on AWS
const API_URL = `http://${window.location.hostname}:3001/api/products`;
let products = [];

// DOM Elements
const navDashboard = document.getElementById('nav-dashboard');
const navProducts = document.getElementById('nav-products');
const dashboardSection = document.getElementById('dashboard-section');
const productsSection = document.getElementById('products-section');

const statTotalProducts = document.getElementById('stat-total-products');
const statTotalStock = document.getElementById('stat-total-stock');
const statLowStock = document.getElementById('stat-low-stock');
const statOutStock = document.getElementById('stat-out-stock');

const recentProductsTable = document.querySelector('#recent-products-table tbody');
const productsTable = document.querySelector('#products-table tbody');

const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');

const btnAddProduct = document.getElementById('btn-add-product');
const productModal = document.getElementById('product-modal');
const closeBtn = document.querySelector('.close-btn');
const btnCancel = document.getElementById('btn-cancel');
const productForm = document.getElementById('product-form');
const formError = document.getElementById('form-error');
const modalTitle = document.getElementById('modal-title');

// Navigation
navDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    navDashboard.classList.add('active');
    navProducts.classList.remove('active');
    dashboardSection.style.display = 'block';
    productsSection.style.display = 'none';
    updateDashboard();
});

navProducts.addEventListener('click', (e) => {
    e.preventDefault();
    navProducts.classList.add('active');
    navDashboard.classList.remove('active');
    productsSection.style.display = 'block';
    dashboardSection.style.display = 'none';
    renderProductsTable();
});

// Modal handlers
const openModal = (isEdit = false, product = null) => {
    formError.textContent = '';
    productModal.classList.add('show');
    if (isEdit && product) {
        modalTitle.textContent = 'Edit Product';
        document.getElementById('product-id').value = product.id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-sku').value = product.sku;
        document.getElementById('product-category').value = product.category;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-qty').value = product.quantity;
        document.getElementById('product-min-stock').value = product.minimumStock;
    } else {
        modalTitle.textContent = 'Add Product';
        productForm.reset();
        document.getElementById('product-id').value = '';
    }
};

const closeModal = () => {
    productModal.classList.remove('show');
    productForm.reset();
};

btnAddProduct.addEventListener('click', () => openModal(false));
closeBtn.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);

// Fetch data
const fetchProducts = async () => {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('Failed to fetch products');
        products = await res.json();
        updateCategories();
        if (dashboardSection.style.display !== 'none') {
            updateDashboard();
        } else {
            renderProductsTable();
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('Error connecting to backend API');
    }
};

// Utilities
const getStockStatus = (qty, minStock) => {
    if (qty === 0) return { label: 'Out of Stock', class: 'out-of-stock' };
    if (qty > 0 && qty <= minStock) return { label: 'Low Stock', class: 'low-stock' };
    return { label: 'In Stock', class: 'in-stock' };
};

const updateCategories = () => {
    const categories = [...new Set(products.map(p => p.category))];
    const currentVal = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(c => {
        categoryFilter.innerHTML += `<option value="${c}">${c}</option>`;
    });
    categoryFilter.value = currentVal;
};

// Dashboard
const updateDashboard = () => {
    statTotalProducts.textContent = products.length;
    
    let totalStock = 0;
    let lowStock = 0;
    let outStock = 0;

    products.forEach(p => {
        totalStock += p.quantity;
        if (p.quantity === 0) {
            outStock++;
        } else if (p.quantity <= p.minimumStock) {
            lowStock++;
        }
    });

    statTotalStock.textContent = totalStock;
    statLowStock.textContent = lowStock;
    statOutStock.textContent = outStock;

    // Recent products (top 5)
    recentProductsTable.innerHTML = '';
    const recent = products.slice(0, 5);
    recent.forEach(p => {
        const status = getStockStatus(p.quantity, p.minimumStock);
        recentProductsTable.innerHTML += `
            <tr>
                <td>${p.sku}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>$${Number(p.price).toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td><span class="badge ${status.class}">${status.label}</span></td>
            </tr>
        `;
    });
};

// Products Table
const renderProductsTable = () => {
    const term = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;

    const filtered = products.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(term) || p.sku.toLowerCase().includes(term);
        const matchCat = cat === '' || p.category === cat;
        return matchSearch && matchCat;
    });

    productsTable.innerHTML = '';
    filtered.forEach(p => {
        const status = getStockStatus(p.quantity, p.minimumStock);
        const imageHtml = p.imageUrl 
            ? `<img src="${p.imageUrl}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">` 
            : `<div style="width: 40px; height: 40px; background: #eee; display:flex; align-items:center; justify-content:center; border-radius: 4px; font-size:10px; color:#999;">No Img</div>`;
            
        productsTable.innerHTML += `
            <tr>
                <td>${imageHtml}</td>
                <td>${p.sku}</td>
                <td>${p.name}</td>
                <td>${p.category}</td>
                <td>$${Number(p.price).toFixed(2)}</td>
                <td>${p.quantity}</td>
                <td>${p.minimumStock}</td>
                <td><span class="badge ${status.class}">${status.label}</span></td>
                <td class="action-cell">
                    <button class="btn btn-icon-only" title="Edit" onclick="editProduct(${p.id})">
                        <i class="fa-solid fa-pen"></i>
                    </button>
                    <button class="btn btn-icon-only delete" title="Delete" onclick="deleteProduct(${p.id})">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
};

searchInput.addEventListener('input', renderProductsTable);
categoryFilter.addEventListener('change', renderProductsTable);

// Form Submit (Create/Update)
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    formError.textContent = '';

    const id = document.getElementById('product-id').value;
    
    // Create FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append('name', document.getElementById('product-name').value);
    formData.append('sku', document.getElementById('product-sku').value);
    formData.append('category', document.getElementById('product-category').value);
    formData.append('price', parseFloat(document.getElementById('product-price').value));
    formData.append('quantity', parseInt(document.getElementById('product-qty').value));
    formData.append('minimumStock', parseInt(document.getElementById('product-min-stock').value) || 0);

    const imageFile = document.getElementById('product-image').files[0];
    if (imageFile) {
        formData.append('image', imageFile);
    }

    try {
        const url = id ? `${API_URL}/${id}` : API_URL;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            // Do NOT set Content-Type header when sending FormData
            body: formData
        });

        const result = await res.json();

        if (!res.ok) {
            formError.textContent = result.message || 'An error occurred';
            return;
        }

        closeModal();
        fetchProducts(); // Refresh
    } catch (error) {
        console.error('Error saving product:', error);
        formError.textContent = 'Server error. Please try again.';
    }
});

// Global functions for inline handlers
window.editProduct = (id) => {
    const product = products.find(p => p.id === id);
    if (product) {
        openModal(true, product);
    }
};

window.deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
        try {
            const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            alert('Error deleting product');
        }
    }
};

// Init
fetchProducts();
