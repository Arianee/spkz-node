#!/bin/bash

cd ../spkz-node
git checkout develop
git fetch
npm i @arianee/spkz-sdk@latest -s
git checkout -b feat/updateSDK
git commit -am "feat: update spk-sdk"
gh pr create --fill
cd ../spkz-bouncer
npm i @arianee/spkz-sdk@latest -s
git fetch
git reset --hard origin/develop
git checkout -b feat/updateSDK
git commit -am "feat: update spk-sdk"
gh pr create --fill
cd ../spkz-front
npm i @arianee/spkz-sdk@latest -s
git checkout -b feat/updateSDK
git commit -am "feat: update spk-sdk"
gh pr create --fill
