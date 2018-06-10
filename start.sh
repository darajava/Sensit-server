forever stop frontendserver
forever stop mainserver
forever stop socketserver

forever -a --uid socketserver start -c 'node chat.js' ./
forever -a --uid mainserver start -c 'npm start' ./
cd ../Sensit
forever -a --uid frontendserver start -c 'npm run start:prelive' ../Sensit/
cd -

sudo pkill mongod
sudo mongod --fork --logpath /var/log/mongod.log