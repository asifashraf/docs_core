# install redis-server
sudo apt-get install -y redis-server
# enable redis-server to start on boot
sudo systemctl enable redis-server
# start redis-server service
sudo systemctl start redis-server

# check redis-server status
sudo systemctl status redis-server
# check redis-server version
redis-server --version
# check if redis-server is running
redis-cli ping  
# should return PONG


### Remove redis-server (uncomment to use)
# sudo systemctl stop redis-server
# sudo systemctl disable redis-server
# sudo apt-get remove -y redis-server
# sudo apt-get purge -y redis-server
# sudo apt-get autoremove -y    
# verify removal
# redis-server --version