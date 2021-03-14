#!/bin/bash

#On error no such file entrypoint.sh, execute in terminal - dos2unix .docker\entrypoint.sh

### FRONT-END
npm config set cache /var/www/.npm-cache --global
cd frontend
npm install
cd ..

### BACK-END
cd backend
chown -R www-data:www-data .
if [ ! -f ".env" ]; then
  cp .env.example .env
fi
if [ ! -f ".env.testing" ]; then
  cp .env.testing.example .env.testing
fi
composer install
php artisan key:generate
php artisan migrate

php-fpm
