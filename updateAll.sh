#!/bin/bash

cd ../spkz-node
npm i @arianee/spkz-sdk@latest -s
git checkout -b feat/updateSDK
git commit -am "feat: update spk-sdk"
gh pr create --fill
cd ../spkz-bouncer
npm i @arianee/spkz-sdk@latest -s
git checkout -b feat/updateSDK
git commit -am "feat: update spk-sdk"
gh pr create --fill
cd ../spkz-front
npm i @arianee/spkz-sdk@latest -s
git checkout -b feat/updateSDK
git commit -am "feat: update spk-sdk"
gh pr create --fill
