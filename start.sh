forever stop frontendserver
forever stop mainserver
forever stop socketserver

kill -9 $(lsof -i TCP:11111 | grep LISTEN | awk '{print $2}')

forever -a --uid socketserver start -c 'node chat.js' ./
forever -a --uid mainserver start -c 'npm start' ./
cd ../Sensit
forever -a --uid frontendserver start -c 'npm run start:prelive' ../Sensit/
cd -

sudo kill -9 $(lsof -i TCP:27017 | grep LISTEN | awk '{print $2}')
sudo pkill mongod
sudo mongod --fork --logpath /var/log/mongod.log

