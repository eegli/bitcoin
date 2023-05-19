# this script is only used to build
# the docker image and save it to a tar file 

set -e
# docker rmi btcsql
docker commit btcsql btcsql:latest
docker save -o btcsql.tar btcsql:latest