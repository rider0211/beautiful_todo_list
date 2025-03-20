# Simple Project Management with Laravel pusher and PrimeReact

This is a simple project management system which is built of Laravel for backend and React for frontend.

Laravel version: v12\
React version: v19\
PHP: 8.3.17\
Node: 22.6.0

## Installation

### Backend (Laravel)

1. Clone the repository:

```bash
git clone https://github.com/sharp0904/CLink_TEST.git
cd server
```

2. Install the required PHP dependencies:

Make sure you have [Composer](https://getcomposer.org/) installed. If not, install it.

```bash
composer install
```
3. Set up your environment file:

Copy the .env.example file to .env:

```bash
cp .env.example .env
```
4. Generate an application key:

```bash
php artisan key:generate
```
5. Set up the database:
- Create a database in MySQL
- Update the .env file with your database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
```
6. Run database migrations:

```php
php artisan migrate
php artisan db:seed --class=ProjectTaskSeeder
```
7. Set up the pusher key:
```env
PUSHER_APP_ID=YOUR_PUSHER_APP_ID
PUSHER_APP_KEY=YOU_PUSHER_APP_KEY
PUSHER_APP_SECRET=YOUR_PUSHER_APP_SECRET
PUSHER_APP_CLUSTER=YOUR_PUSHER_CLUSTER
```
8. Start the backend development server:

```bash
php artisan serve
```

Laravel backend will be running at `http://localhost:8000`.

### Frontend (React)

1. Install Node.js dependencies:

Make sure you have [Node.js](https://nodejs.org/) installed. If not, install it.\
Inside your project directory, navigate to the frontend directory:
```bash
cd client
```
Then install the required npm packages:
```bash
npm install
```
2. Start the frontend development server:
```bash
npm start
```
React frontend will be running at `http://localhost:3000`.

## Usage

- The backend will handle API requests, while the frontend will interact with these APIs to display data.
- Once both the backend and frontend are running, you can start managing projects through the system.

## Contributing

I would appreciate any feedback on this! Feel free to share your thoughts or suggestions for improvement.

Thank you!
