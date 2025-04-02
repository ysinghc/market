// Monthly Revenue Chart (Bar Chart)
const monthlyRevenueCtx = document.getElementById('chartjs-bar');
if (monthlyRevenueCtx) {
    new Chart(monthlyRevenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue',
                data: [12000, 19000, 15000, 25000, 22000, 30000, 28000, 32000, 35000, 30000, 28000, 25000],
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgb(0, 123, 255)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Crop Sales Distribution Chart (Doughnut Chart)
const cropDistributionCtx = document.getElementById('chartjs-doughnut');
if (cropDistributionCtx) {
    new Chart(cropDistributionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Rice', 'Wheat', 'Potatoes', 'Tomatoes', 'Onions'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Revenue by Customer Type Chart (Pie Chart)
const customerTypeCtx = document.getElementById('chartjs-pie');
if (customerTypeCtx) {
    new Chart(customerTypeCtx, {
        type: 'pie',
        data: {
            labels: ['Restaurants', 'Individual Buyers', 'Wholesalers'],
            datasets: [{
                data: [7850, 5200, 2700],
                backgroundColor: [
                    'rgba(0, 123, 255, 0.5)',
                    'rgba(255, 193, 7, 0.5)',
                    'rgba(220, 53, 69, 0.5)'
                ],
                borderColor: [
                    'rgba(0, 123, 255, 1)',
                    'rgba(255, 193, 7, 1)',
                    'rgba(220, 53, 69, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Function to update charts with real data
async function updateCharts() {
    try {
        if (isOffline()) {
            // Load data from IndexedDB
            const inventory = await offlineStorage.getInventory();
            const orders = await offlineStorage.getOrders();
            updateChartsWithData(inventory, orders);
        } else {
            // Fetch data from server
            const [inventoryResponse, ordersResponse] = await Promise.all([
                fetch('/api/inventory'),
                fetch('/api/orders')
            ]);

            if (!inventoryResponse.ok || !ordersResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const inventory = await inventoryResponse.json();
            const orders = await ordersResponse.json();

            // Save to IndexedDB for offline use
            await offlineStorage.saveInventory(inventory);
            await offlineStorage.saveOrders(orders);

            updateChartsWithData(inventory, orders);
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

// Function to update charts with actual data
function updateChartsWithData(inventory, orders) {
    // Process data and update charts
    // This would involve calculating totals, grouping by categories, etc.
    // For now, we're using static data as shown above
}

// Update charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCharts();
}); 