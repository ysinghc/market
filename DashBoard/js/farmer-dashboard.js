// Configuration
const API_BASE_URL = 'http://localhost:5000/api';
let authToken = localStorage.getItem('token');
let dashboardData = null;

// Check if user is logged in
function checkAuth() {
  if (!authToken) {
    window.location.href = '../login_registration/Login_page/loginform.html';
    return false;
  }
  return true;
}

// API request helper
async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };

    const options = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    if (error.message === 'Not authorized to access this route') {
      localStorage.removeItem('token');
      window.location.href = '../login_registration/Login_page/loginform.html';
    }
    throw error;
  }
}

// Load dashboard data
async function loadDashboardData() {
  try {
    if (!checkAuth()) return;
    
    // Show loading state
    document.getElementById('dashboard-loader').style.display = 'block';
    
    // Fetch dashboard data
    const response = await apiRequest('/dashboard/farmer');
    dashboardData = response.data;
    
    // Update summary cards
    updateSummaryCards();
    
    // Update charts
    updateCharts();
    
    // Update tables
    updateTables();
    
    // Hide loading state
    document.getElementById('dashboard-loader').style.display = 'none';
  } catch (error) {
    console.error('Failed to load dashboard data:', error);
    // Hide loading state
    document.getElementById('dashboard-loader').style.display = 'none';
    // Show error message
    alert('Failed to load dashboard data. Please try again later.');
  }
}

// Update summary cards with real data
function updateSummaryCards() {
  if (!dashboardData || !dashboardData.summary) return;
  
  const { totalRevenue, totalSales, pendingOrders, rating } = dashboardData.summary;
  
  // Update total revenue card
  document.querySelector('.total-revenue-value').textContent = `₹${totalRevenue.value.toLocaleString()}`;
  document.querySelector('.total-revenue-growth').textContent = `${totalRevenue.growth > 0 ? '+' : ''}${totalRevenue.growth}% from last month`;
  
  // Update total sales card
  document.querySelector('.total-sales-value').textContent = `${totalSales.value.toLocaleString()} kg`;
  document.querySelector('.total-sales-growth').textContent = `${totalSales.growth > 0 ? '+' : ''}${totalSales.growth}% from last month`;
  
  // Update pending orders card
  document.querySelector('.pending-orders-value').textContent = pendingOrders.value;
  document.querySelector('.processing-orders').textContent = `${pendingOrders.processing} awaiting shipment`;
  
  // Update rating card
  document.querySelector('.rating-value').textContent = `${rating.value}/5.0`;
  document.querySelector('.rating-count').textContent = `Based on ${rating.totalReviews} reviews`;
}

// Update charts with real data
function updateCharts() {
  if (!dashboardData || !dashboardData.charts) return;
  
  const { monthlyRevenue, cropDistribution, customerRevenue } = dashboardData.charts;
  
  // Update the monthly revenue chart
  if (window.revenueChart) {
    window.revenueChart.data.datasets[0].data = monthlyRevenue.revenue;
    window.revenueChart.data.datasets[1].data = monthlyRevenue.quantity;
    window.revenueChart.update();
  }
  
  // Update the crop distribution chart
  if (window.cropChart) {
    window.cropChart.data.labels = cropDistribution.map(crop => crop.name);
    window.cropChart.data.datasets[0].data = cropDistribution.map(crop => crop.quantity);
    window.cropChart.update();
  }
  
  // Update the customer revenue chart
  if (window.customerChart) {
    window.customerChart.data.labels = customerRevenue.map(item => item.type);
    window.customerChart.data.datasets[0].data = customerRevenue.map(item => item.value);
    window.customerChart.update();
  }
  
  // Update customer revenue breakdown
  const totalCustomerRevenue = customerRevenue.reduce((sum, item) => sum + item.value, 0);
  
  customerRevenue.forEach((item, index) => {
    const percentage = totalCustomerRevenue > 0 ? Math.round((item.value / totalCustomerRevenue) * 100) : 0;
    
    // Get the correct progress bar and label
    const progressBar = document.querySelectorAll('.progress-bar')[index];
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      progressBar.setAttribute('aria-valuenow', percentage);
    }
    
    // Update value text
    const valueLabel = document.querySelectorAll('.revenue-customer-value')[index];
    if (valueLabel) {
      valueLabel.textContent = `₹${item.value.toLocaleString()}`;
    }
  });
}

// Update tables with real data
function updateTables() {
  if (!dashboardData) return;
  
  // Update recently sold crops table
  const recentSoldCropsTable = document.querySelector('#recently-sold-crops tbody');
  if (recentSoldCropsTable && dashboardData.recentSoldCrops) {
    recentSoldCropsTable.innerHTML = '';
    
    dashboardData.recentSoldCrops.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.orderId}</td>
        <td>${item.crop}</td>
        <td>${item.quantity}</td>
        <td>${item.pricePerUnit}</td>
        <td>${item.total}</td>
        <td>${item.date}</td>
        <td><span class="badge bg-success">${item.status}</span></td>
      `;
      recentSoldCropsTable.appendChild(row);
    });
  }
  
  // Update top selling crops table
  const topSellingCropsTable = document.querySelector('#top-selling-crops tbody');
  if (topSellingCropsTable && dashboardData.topSellingCrops) {
    topSellingCropsTable.innerHTML = '';
    
    dashboardData.topSellingCrops.forEach(crop => {
      const row = document.createElement('tr');
      const growthClass = parseFloat(crop.growth) >= 0 ? 'text-success' : 'text-danger';
      row.innerHTML = `
        <td>${crop.name}</td>
        <td>${crop.quantity} kg</td>
        <td>₹${crop.revenue.toLocaleString()}</td>
        <td><span class="${growthClass}">${crop.growth >= 0 ? '+' : ''}${crop.growth}%</span></td>
      `;
      topSellingCropsTable.appendChild(row);
    });
  }
}

// Initialize chart objects
function initializeCharts() {
  // Monthly Revenue Chart
  const barChartCanvas = document.getElementById('chartjs-bar');
  if (barChartCanvas) {
    window.revenueChart = new Chart(barChartCanvas, {
      type: 'bar',
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          label: "Revenue (₹)",
          backgroundColor: window.theme.primary,
          borderColor: window.theme.primary,
          hoverBackgroundColor: window.theme.primary,
          hoverBorderColor: window.theme.primary,
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          barPercentage: .75,
          categoryPercentage: .5
        }, {
          label: "Quantity Sold (kg)",
          backgroundColor: "#dee2e6",
          borderColor: "#dee2e6",
          hoverBackgroundColor: "#dee2e6",
          hoverBorderColor: "#dee2e6",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          barPercentage: .75,
          categoryPercentage: .5
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: true
        },
        scales: {
          yAxes: [{
            gridLines: {
              display: true
            },
            stacked: false,
            ticks: {
              stepSize: 5000
            }
          }],
          xAxes: [{
            stacked: false,
            gridLines: {
              color: "transparent"
            }
          }]
        }
      }
    });
  }
  
  // Crop Distribution Chart
  const doughnutChartCanvas = document.getElementById('chartjs-doughnut');
  if (doughnutChartCanvas) {
    window.cropChart = new Chart(doughnutChartCanvas, {
      type: 'doughnut',
      data: {
        labels: ["Loading...", "Loading...", "Loading...", "Loading...", "Loading..."],
        datasets: [{
          data: [0, 0, 0, 0, 0],
          backgroundColor: [
            window.theme.primary,
            window.theme.success,
            window.theme.warning,
            window.theme.danger,
            "#dee2e6"
          ],
          borderColor: "transparent"
        }]
      },
      options: {
        maintainAspectRatio: false,
        cutoutPercentage: 65,
        legend: {
          display: true
        }
      }
    });
  }
  
  // Customer Revenue Chart
  const pieChartCanvas = document.getElementById('chartjs-pie');
  if (pieChartCanvas) {
    window.customerChart = new Chart(pieChartCanvas, {
      type: 'pie',
      data: {
        labels: ["Restaurants", "Individual Buyers", "Wholesalers"],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: [
            window.theme.primary,
            window.theme.warning,
            window.theme.danger
          ],
          borderColor: "transparent"
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: {
          display: true
        }
      }
    });
  }
}

// Handle logout
function logout() {
  localStorage.removeItem('token');
  window.location.href = '../login_registration/Login_page/loginform.html';
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Add loading indicator to the page
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'dashboard-loader';
  loadingDiv.className = 'loader-overlay';
  loadingDiv.innerHTML = '<div class="spinner-border text-primary" role="status"><span class="sr-only">Loading...</span></div>';
  loadingDiv.style.display = 'none';
  document.body.appendChild(loadingDiv);
  
  // Initialize charts
  initializeCharts();
  
  // Add classes to elements for easy selection
  const totalRevenueValue = document.querySelector('.col-xl-3:nth-child(1) .h4');
  if (totalRevenueValue) totalRevenueValue.classList.add('total-revenue-value');
  
  const totalRevenueGrowth = document.querySelector('.col-xl-3:nth-child(1) .text-muted');
  if (totalRevenueGrowth) totalRevenueGrowth.classList.add('total-revenue-growth');
  
  const totalSalesValue = document.querySelector('.col-xl-3:nth-child(2) .h4');
  if (totalSalesValue) totalSalesValue.classList.add('total-sales-value');
  
  const totalSalesGrowth = document.querySelector('.col-xl-3:nth-child(2) .text-muted');
  if (totalSalesGrowth) totalSalesGrowth.classList.add('total-sales-growth');
  
  const pendingOrdersValue = document.querySelector('.col-xl-3:nth-child(3) .h4');
  if (pendingOrdersValue) pendingOrdersValue.classList.add('pending-orders-value');
  
  const processingOrders = document.querySelector('.col-xl-3:nth-child(3) .text-muted');
  if (processingOrders) processingOrders.classList.add('processing-orders');
  
  const ratingValue = document.querySelector('.col-xl-3:nth-child(4) .h4');
  if (ratingValue) ratingValue.classList.add('rating-value');
  
  const ratingCount = document.querySelector('.col-xl-3:nth-child(4) .text-muted');
  if (ratingCount) ratingCount.classList.add('rating-count');
  
  // Add IDs to tables
  const recentlyTable = document.querySelector('.row:nth-child(3) .card .table');
  if (recentlyTable) recentlyTable.id = 'recently-sold-crops';
  
  const topSellingTable = document.querySelector('.row:nth-child(4) .col-lg-6:nth-child(1) .table');
  if (topSellingTable) topSellingTable.id = 'top-selling-crops';
  
  // Add classes to revenue breakdowns
  const customerValueElements = document.querySelectorAll('.d-flex.justify-content-between.mb-1 div:nth-child(2)');
  customerValueElements.forEach(el => {
    el.classList.add('revenue-customer-value');
  });
  
  // Add logout functionality
  const logoutLink = document.querySelector('a.dropdown-item[href="#"]');
  if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
      e.preventDefault();
      logout();
    });
  }
  
  // Load dashboard data
  loadDashboardData();
  
  // Set up refresh interval (every 5 minutes)
  setInterval(loadDashboardData, 5 * 60 * 1000);
}); 