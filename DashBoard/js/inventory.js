// Inventory Management JavaScript

// Sample data - would normally come from a database
let crops = [
    {
        id: 1,
        name: 'Wheat',
        category: 'grains',
        quantity: 500,
        price: 32,
        description: 'Premium quality wheat, organically grown without pesticides.',
        harvestDate: '2023-10-15',
        image: '../MarketPlace/images/wheat.jpg',
        minOrder: 10,
        availableUntil: '2023-12-31',
        publishedToMarketplace: true
    },
    {
        id: 2,
        name: 'Rice',
        category: 'grains',
        quantity: 450,
        price: 40,
        description: 'Premium Basmati rice, known for its aroma and length.',
        harvestDate: '2023-09-25',
        image: '../MarketPlace/images/rice.jpg',
        minOrder: 5,
        availableUntil: '2023-12-15',
        publishedToMarketplace: true
    },
    {
        id: 3,
        name: 'Tomatoes',
        category: 'vegetables',
        quantity: 200,
        price: 45,
        description: 'Juicy, ripe tomatoes grown in nutrient-rich soil.',
        harvestDate: '2023-10-18',
        image: '../MarketPlace/images/tomatoes.jpg',
        minOrder: 2,
        availableUntil: '2023-11-05',
        publishedToMarketplace: false
    }
];

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    displayCrops();
    setupEventListeners();
    
    // Set today's date as the default harvest date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('crop-harvest-date').value = today;
    
    // Set a default availability date (30 days from now)
    const defaultAvailability = new Date();
    defaultAvailability.setDate(defaultAvailability.getDate() + 30);
    document.getElementById('availability').value = defaultAvailability.toISOString().split('T')[0];
});

function setupEventListeners() {
    // Form submission
    document.getElementById('upload-crop-form').addEventListener('submit', function(event) {
        event.preventDefault();
        uploadCrop();
    });
    
    // Image preview
    document.getElementById('crop-image').addEventListener('change', function(event) {
        previewImage(event);
    });
}

function displayCrops() {
    const cropList = document.getElementById('crop-list');
    
    // Clear existing list
    cropList.innerHTML = '';
    
    // Add each crop to the list
    crops.forEach((crop, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                <a href="#" class="crop-name" data-bs-toggle="modal" data-bs-target="#cropDetailsModal" data-id="${crop.id}">
                    ${crop.name}
                    ${crop.publishedToMarketplace ? '<span class="badge bg-success ms-2">Published</span>' : '<span class="badge bg-secondary ms-2">Draft</span>'}
                </a>
            </td>
            <td>${crop.quantity} kg</td>
            <td>₹${crop.price}/kg</td>
            <td>
                <div class="btn-group">
                    <button class="btn btn-sm btn-primary" onclick="editCrop(${crop.id})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCrop(${crop.id})">Remove</button>
                    ${!crop.publishedToMarketplace ? 
                        `<button class="btn btn-sm btn-success" onclick="publishCrop(${crop.id})">Publish</button>` : 
                        `<button class="btn btn-sm btn-warning" onclick="unpublishCrop(${crop.id})">Unpublish</button>`
                    }
                </div>
            </td>
        `;
        
        cropList.appendChild(row);
    });
    
    // Add event listeners to crop names
    document.querySelectorAll('.crop-name').forEach(link => {
        link.addEventListener('click', function() {
            const cropId = parseInt(this.getAttribute('data-id'));
            showCropDetails(cropId);
        });
    });
}

function uploadCrop() {
    // Get form values
    const name = document.getElementById('crop-name').value;
    const category = document.getElementById('crop-category').value;
    const quantity = parseInt(document.getElementById('crop-quantity').value);
    const price = parseFloat(document.getElementById('crop-price').value);
    const description = document.getElementById('crop-description').value;
    const harvestDate = document.getElementById('crop-harvest-date').value;
    const minOrder = parseInt(document.getElementById('min-order').value);
    const availableUntil = document.getElementById('availability').value;
    const publishedToMarketplace = document.getElementById('publish-marketplace').checked;
    
    // Get image (would normally be uploaded to server and return URL)
    const imageInput = document.getElementById('crop-image');
    let imagePath = '../MarketPlace/images/placeholder.jpg';
    
    // Create new crop object
    const newCrop = {
        id: crops.length > 0 ? Math.max(...crops.map(crop => crop.id)) + 1 : 1,
        name,
        category,
        quantity,
        price,
        description,
        harvestDate,
        image: imagePath,
        minOrder,
        availableUntil,
        publishedToMarketplace
    };
    
    // Add to crops array
    crops.push(newCrop);
    
    // Update display
    displayCrops();
    
    // Reset form
    document.getElementById('upload-crop-form').reset();
    
    // Show success message
    showAlert('Crop successfully added to your inventory!', 'success');
    
    // Set today's date as the default harvest date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('crop-harvest-date').value = today;
    
    // Set a default availability date (30 days from now)
    const defaultAvailability = new Date();
    defaultAvailability.setDate(defaultAvailability.getDate() + 30);
    document.getElementById('availability').value = defaultAvailability.toISOString().split('T')[0];
}

function previewImage(event) {
    // Function to preview the uploaded image
    const file = event.target.files[0];
    
    if (file) {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Would normally display a preview here
            console.log('Image loaded: ', e.target.result);
        };
        
        reader.readAsDataURL(file);
    }
}

function showCropDetails(cropId) {
    // Find the crop in the array
    const crop = crops.find(c => c.id === cropId);
    
    if (!crop) return;
    
    // Populate modal with crop details
    document.getElementById('modalCropName').textContent = crop.name;
    document.getElementById('modalCropCategory').textContent = crop.category;
    document.getElementById('modalCropQuantity').textContent = `${crop.quantity} kg`;
    document.getElementById('modalCropPrice').textContent = `₹${crop.price} per kg`;
    document.getElementById('modalCropHarvestDate').textContent = crop.harvestDate;
    document.getElementById('modalCropAvailableUntil').textContent = crop.availableUntil;
    document.getElementById('modalCropMinOrder').textContent = `${crop.minOrder} kg`;
    document.getElementById('modalCropDescription').textContent = crop.description;
    
    // Set image
    const modalImage = document.getElementById('modalCropImage');
    modalImage.src = crop.image;
    modalImage.onerror = function() {
        this.src = '../MarketPlace/images/placeholder.jpg';
    };
    
    // Set status
    const statusContainer = document.getElementById('modalCropStatus');
    if (crop.publishedToMarketplace) {
        statusContainer.innerHTML = `
            <span class="badge bg-success me-2">Published to Marketplace</span>
            <button class="btn btn-sm btn-warning" onclick="unpublishCrop(${crop.id})" data-bs-dismiss="modal">Unpublish</button>
        `;
    } else {
        statusContainer.innerHTML = `
            <span class="badge bg-secondary me-2">Draft (Not Published)</span>
            <button class="btn btn-sm btn-success" onclick="publishCrop(${crop.id})" data-bs-dismiss="modal">Publish</button>
        `;
    }
}

function editCrop(cropId) {
    // Find the crop in the array
    const crop = crops.find(c => c.id === cropId);
    
    if (!crop) return;
    
    // Populate form with crop details
    document.getElementById('crop-name').value = crop.name;
    document.getElementById('crop-category').value = crop.category;
    document.getElementById('crop-quantity').value = crop.quantity;
    document.getElementById('crop-price').value = crop.price;
    document.getElementById('crop-description').value = crop.description;
    document.getElementById('crop-harvest-date').value = crop.harvestDate;
    document.getElementById('min-order').value = crop.minOrder;
    document.getElementById('availability').value = crop.availableUntil;
    document.getElementById('publish-marketplace').checked = crop.publishedToMarketplace;
    
    // Scroll to form
    document.querySelector('.card-title:contains("Upload New Crop")').scrollIntoView({ behavior: 'smooth' });
    
    // Show message
    showAlert('Editing crop: ' + crop.name, 'info');
    
    // Remove crop from array (will be re-added when form is submitted)
    crops = crops.filter(c => c.id !== cropId);
    
    // Update display
    displayCrops();
}

function deleteCrop(cropId) {
    // Confirm deletion
    if (!confirm('Are you sure you want to remove this crop?')) {
        return;
    }
    
    // Find the crop in the array
    const cropIndex = crops.findIndex(c => c.id === cropId);
    
    if (cropIndex === -1) return;
    
    // Get crop name before deletion
    const cropName = crops[cropIndex].name;
    
    // Remove from array
    crops.splice(cropIndex, 1);
    
    // Update display
    displayCrops();
    
    // Show success message
    showAlert(`${cropName} removed from inventory`, 'success');
}

function publishCrop(cropId) {
    // Find the crop in the array
    const crop = crops.find(c => c.id === cropId);
    
    if (!crop) return;
    
    // Update published status
    crop.publishedToMarketplace = true;
    
    // Update display
    displayCrops();
    
    // Show success message
    showAlert(`${crop.name} published to marketplace`, 'success');
}

function unpublishCrop(cropId) {
    // Find the crop in the array
    const crop = crops.find(c => c.id === cropId);
    
    if (!crop) return;
    
    // Update published status
    crop.publishedToMarketplace = false;
    
    // Update display
    displayCrops();
    
    // Show success message
    showAlert(`${crop.name} removed from marketplace`, 'warning');
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alertElement = document.createElement('div');
    alertElement.className = `alert alert-${type} alert-dismissible fade show`;
    alertElement.role = 'alert';
    alertElement.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to page
    const alertsContainer = document.getElementById('alerts-container');
    if (!alertsContainer) {
        // Create container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'alerts-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '9999';
        container.style.maxWidth = '300px';
        document.body.appendChild(container);
        container.appendChild(alertElement);
    } else {
        alertsContainer.appendChild(alertElement);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
        setTimeout(() => {
            alertElement.remove();
        }, 500);
    }, 5000);
} 