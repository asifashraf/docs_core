#!/bin/bash

# on ubuntu 24.04 install docker server and docker-compose  

# apt update and upgrade
sudo apt-get update && sudo apt-get upgrade -y

# install docker
sudo apt-get install -y docker.io

# enable docker to start on boot
sudo systemctl enable docker

# start docker service
sudo systemctl start docker

# check docker status
sudo systemctl status docker

# check docker version
docker --version
# install docker-compose
sudo apt-get install -y docker-compose
# check docker-compose version
docker-compose --version
# add current user to docker group to run docker without sudo
sudo usermod -aG docker $USER
# apply new group membership
newgrp docker
# verify docker can be run without sudo
docker run hello-world