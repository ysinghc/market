# FarmSync API

A FastAPI-based backend for the FarmSync marketplace application.

## Features

- User authentication and authorization
- Role-based access control (Admin, Farmer, Buyer)
- Crop management
- Order management
- Review system
- Dashboard with statistics and analytics
- File upload support for crop photos

## Tech Stack

- FastAPI
- PostgreSQL
- SQLAlchemy
- JWT Authentication
- Docker & Docker Compose

## Prerequisites

- Docker and Docker Compose
- Python 3.11+ (for local development)

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd backend_py
```

2. Create a `.env` file with the following variables:
```env
POSTGRES_SERVER=db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=farmsync
SECRET_KEY=your-secret-key-here
```

3. Build and start the containers:
```bash
docker-compose up --build
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the application is running, you can access:
- Swagger UI: `http://localhost:8000/api/docs`
- ReDoc: `http://localhost:8000/api/redoc`

## Development

To run the application locally without Docker:

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the application:
```bash
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication
- POST `/api/v1/auth/login` - Login to get access token

### Users
- GET `/api/v1/users/me` - Get current user
- GET `/api/v1/users/` - Get all users (admin only)
- POST `/api/v1/users/` - Create new user (admin only)
- PUT `/api/v1/users/me` - Update current user
- GET `/api/v1/users/{user_id}` - Get user by ID

### Crops
- GET `/api/v1/crops/` - Get all crops
- POST `/api/v1/crops/` - Create new crop (farmer only)
- PUT `/api/v1/crops/{crop_id}` - Update crop (farmer only)
- GET `/api/v1/crops/{crop_id}` - Get crop by ID
- POST `/api/v1/crops/{crop_id}/photo` - Upload crop photo (farmer only)

### Orders
- GET `/api/v1/orders/` - Get all orders
- POST `/api/v1/orders/` - Create new order (buyer only)
- PUT `/api/v1/orders/{order_id}` - Update order
- GET `/api/v1/orders/{order_id}` - Get order by ID

### Reviews
- GET `/api/v1/reviews/` - Get all reviews
- POST `/api/v1/reviews/` - Create new review (buyer only)
- PUT `/api/v1/reviews/{review_id}` - Update review (buyer only)
- GET `/api/v1/reviews/{review_id}` - Get review by ID

### Dashboard
- GET `/api/v1/dashboard/stats` - Get dashboard statistics
- GET `/api/v1/dashboard/analytics` - Get dashboard analytics

## Deployment

The application is configured to be deployed using Cloudflare Tunnels. To deploy:

1. Install Cloudflare Tunnel client:
```bash
# On Linux
curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared.deb
```

2. Authenticate with Cloudflare:
```bash
cloudflared tunnel login
```

3. Create a tunnel:
```bash
cloudflared tunnel create farmsync-api
```

4. Configure the tunnel:
```bash
cloudflared tunnel route dns farmsync-api api.ysinghc.me
```

5. Create a config file `config.yml`:
```yaml
tunnel: <tunnel-id>
credentials-file: /root/.cloudflared/<tunnel-id>.json
ingress:
  - hostname: api.ysinghc.me
    service: http://localhost:8000
  - service: http_status:404
```

6. Run the tunnel:
```bash
cloudflared tunnel run farmsync-api
```

## License

 