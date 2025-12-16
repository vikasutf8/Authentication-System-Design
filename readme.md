- DB config → URI builder → connection → indexes with dummy env values.
1. feat(db): add MongoDB connection setup
2. feat(config): build MongoDB URI from env variables
3. refactor(db): introduce typed DBConfig and singleton DB manager
4. perf(db): disable autoIndex and handle connection events  
5. feat(db): add explicit index creation and graceful shutdown
### username: password @ cluster.hostsuffix/databasename?retryWrites=true&w=majority

- prvent Nosql injection 
 - mongo-sanitize
 - zod validation 

- send mail  -Nodemailer
- Rate limiting - express-rate-limit/Redis on Email/OTP/Ip -- Fixed Algo