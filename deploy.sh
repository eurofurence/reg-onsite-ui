#!/bin/bash

set -e
set -x
#cd "$(dirname $0)"
source nenv/bin/activate
VERSION="$(git rev-parse --short HEAD)"

echo "export const version = \"$VERSION\";" > buildConfig.js

for DEPLOY_ENV in "prod" "dev"; do
    npm run generate
    tar -hczvf onsite.${DEPLOY_ENV}.tar.gz dist
    if [ "${DEPLOY_ENV}" == "dev" ]; then
        scp onsite.${DEPLOY_ENV}.tar.gz "${DEV_DEPLOY_USER}@${DEV_DEPLOY_HOST}:/home/regtest/projects/onsite/onsite.tar.gz"
    fi
done
