#!/bin/bash

set -e
set -x
#cd "$(dirname $0)"
source nenv/bin/activate
VERSION="$(git rev-parse --short HEAD)"

echo "export const version = \"$VERSION\";" > buildConfig.js
yarn generate
tar -hczvf onsite.tar.gz dist
scp onsite.tar.gz "${DEV_DEPLOY_USER}@${DEV_DEPLOY_HOST}:/home/regtest/projects/onsite/onsite.tar.gz"
