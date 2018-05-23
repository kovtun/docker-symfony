#!/bin/bash
source ./.env
export PROJECT_HOST_NAME=${PROJECT_HOST_NAME}
export PROJECT_GIT_REPO=${PROJECT_GIT_REPO}
export SYMFONY_APP_PATH=${SYMFONY_APP_PATH}
eval "git clone ${PROJECT_GIT_REPO} ${SYMFONY_APP_PATH}"
config_file='nginx/symfony.conf'
template_file='nginx/symfony.conf.dist'
envsubst "\${PROJECT_HOST_NAME}" < ${template_file} > ${config_file}
docker-compose build
docker-compose up -d
docker-compose exec php bash -c "composer install"

docker-compose exec php bash -c "chown -R www-data:www-data var/"

docker-compose exec php bash -c "bin/console doctrine:schema:update --force"
docker-compose exec php bash -c "bin/console doctrine:fixtures:load --no-interaction"

