#!/bin/bash

set -e
set -x

source .env
#cd "$(dirname $0)"
source nenv/bin/activate
VERSION="$(git rev-parse --short HEAD)"

echo "export const version = \"$VERSION\";" > buildConfig.js

DEPLOY_FOLDER="postcon"

for DEPLOY_ENV in "prod" "dev"; do
    npm run generate
    rm dist/index.html
    rm -rf dist/sponsordesk
    rm -rf dist/regdesk
    tar -hczvf ${DEPLOY_FOLDER}.${DEPLOY_ENV}.tar.gz dist
    if [ "${DEPLOY_ENV}" == "dev" ]; then
        scp ${DEPLOY_FOLDER}.${DEPLOY_ENV}.tar.gz "${DEV_DEPLOY_USER}@${DEV_HOST}:/home/regtest/projects/${DEPLOY_FOLDER}/${DEPLOY_FOLDER}.tar.gz"
    fi
done
