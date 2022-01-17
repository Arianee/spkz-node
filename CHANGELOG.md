#  Spkz node
#  Release notes
## v1.19.0 ( 2022-01-17 )

### **chore (1):**
 - chore(sdk): bump sdk to get new signature

### **release (1):**
 - release(version): Increase next develop version of v1.18.0

## v1.18.0 ( 2022-01-14 )

### **fix (2):**
 - fix(userProfile): update userProfile model + object sent via ws
 - fix(userProfile): fix casse in userprofile

### **release (1):**
 - release(version): Increase next develop version of v1.17.0

## v1.17.0 ( 2022-01-6 )

### **feat (2):**
 - feat(sentry): add sentry in ws server
 - feat(ws): add joinSection event in ws

### **release (1):**
 - release(version): Increase next develop version of v1.16.0

## v1.16.0 ( 2021-12-13 )

### **feat (1):**
 - feat(sdk): update sdk

### **release (1):**
 - release(version): Increase next develop version of v1.15.0

## v1.15.0 ( 2021-11-30 )

### **fix (2):**
 - fix(ws): remove undefined callback
 - fix(ws): on join room catch error

### **release (1):**
 - release(version): Increase next develop version of v1.14.0

## v1.14.0 ( 2021-11-26 )

### **feat (2):**
 - feat(sdk): update sdk to have poap strategy
 - feat(sdk): update sdk

### **release (1):**
 - release(version): Increase next develop version of v1.13.0

## v1.13.0 ( 2021-11-24 )

### **fix (1):**
 - fix(lastviewed): update lastviewed only if it exists

### **feat (1):**
 - feat(notification): unread mesaages does not count user message

### **release (1):**
 - release(version): Increase next develop version of v1.12.0

## v1.12.0 ( 2021-11-24 )

### **feat (7):**
 - feat(bump): sdk
 - feat(sdk): bump
 - feat(sdk): upgrade
 - feat(sdk): update
 - feat(getmessages): get new message count
 - feat(getmessages): get messages with count and timestamp
 - feat(notification): update last viewed in bdd

### **fix (2):**
 - fix(getmessages): fix casse in message count request
 - fix(getmessages): fix typo

### **release (3):**
 - release(version): Increase next develop version of v1.11.0
 - release(changelog): Update changelog.md [CI SKIP]
 - release(changelog): Update changelog.md [CI SKIP]

## v1.11.0 ( 2021-11-10 )

### **feat (3):**
 - feat(notification): last viewed
 - feat(ci): auto redirect traffic to latest cloud run revision
 - feat(sdk): update

### **release (1):**
 - release(version): Increase next develop version of v1.10.0

## v1.10.0 ( 2021-11-2 )

### **feat (3):**
 - feat(sdk): update sdk
 - feat(sdk): update sdk
 - feat: update spk-sdk

### **release (2):**
 - release(changelog): Update changelog.md [CI SKIP]
 - release(version): Increase next develop version of v1.9.0

## v1.9.0 ( 2021-10-26 )

### **feat (1):**
 - feat(sdk): update

### **release (1):**
 - release(version): Increase next develop version of v1.8.0

## v1.8.0 ( 2021-10-21 )

### **chore (1):**
 - chore(sdk): Bump SDK 1.4

### **release (1):**
 - release(version): Increase next develop version of v1.7.0

## v1.7.1 ( 2021-10-18 )

### **fix (1):**
 - fix(sentry): set env as production for sentry

## v1.7.0 ( 2021-10-18 )

### **fix (3):**
 - fix(sentry): add sentry if deploy on prod
 - fix(sentry): change sentry command according to doc
 - fix(sentry): fix sentry push in ci

### **chore (1):**
 - chore(sdk): update sdk

### **feat (4):**
 - feat(sdk): bump sdk version
 - feat(log): add morganlogger
 - feat(sentry): add sentry
 - feat(sdk): update sdk

### **release (1):**
 - release(version): Increase next develop version of v1.6.0

## v1.6.0 ( 2021-10-18 )

### **feat (3):**
 - feat(sdk): bump
 - feat(sdk): bump
 - feat(sdk): bump

### **chore (1):**
 - chore(sdk): bump

### **release (1):**
 - release(version): Increase next develop version of v1.5.0

## v1.5.0 ( 2021-10-14 )

### **chore (1):**
 - chore(sdk): update sdk

### **release (1):**
 - release(version): Increase next develop version of v1.4.0

## v1.4.0 ( 2021-10-14 )

### **feat (1):**
 - feat(sdk): update sdk

### **release (1):**
 - release(version): Increase next develop version of v1.3.0

## v1.3.0 ( 2021-10-14 )

### **chore (2):**
 - chore(sdk): update sdk
 - chore(sdk): bump

### **fix (2):**
 - fix(members): fix order
 - fix(members): order by profile updatedate

### **feat (9):**
 - feat(sdk): bump
 - feat(sdk): bump sdk
 - feat(sdk): bump sdk
 - feat(profile): get userProfile in join
 - feat(rpc): update spkz-sdk
 - feat(rpc): Fetch profile payload
 - feat(sdk): update package version
 - feat(members): order by updatedAt desc
 - feat(sdk): bump

### **release (1):**
 - release(version): Increase next develop version of v1.2.0

## v1.2.0 ( 2021-10-6 )

### **fix (6):**
 - fix(db): fix indexes in db
 - fix(db): fix join room&#x2F;section whereclose
 - fix(profile): add where constraints
 - fix(cicd): specify spkzenv in ci
 - fix(db): fix sectionusers table
 - fix(db): fix id field

### **feat (3):**
 - feat(sdk): update sdk to have read and write
 - feat(db): add unique index on sectionUsers and roomUsers
 - feat(sdk): upgrade sdk version

### **release (1):**
 - release(version): Increase next develop version of v1.1.0

## v1.1.0 ( 2021-09-30 )

### **feat (3):**
 - feat(cicd): Add web socket build and vpc
 - feat(db): plug user profile and list to postgre dbb
 - feat(websocket): add websocket server

### **fix (3):**
 - fix(websocket): fix ws for production environment
 - fix(docker): Postgres volume
 - fix(websocket): fix redis url in docker compose

### **release (1):**
 - release(version): Increase next develop version of v1.0.0

## v1.0.0 ( 2021-09-28 )

### **fix (2):**
 - fix(cicd): Add scripts changelog and release
 - fix(project): Master main branch

### **feat (5):**
 - feat(project): CI CD
 - feat(project): Init project
 - feat(project): Init project
 - feat(project): Init project
 - feat(project): Init project

