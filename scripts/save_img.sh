set -e
# docker rmi btcsql
docker commit btcsql btcsql:latest
docker save -o btcsql.tar btcsql:latest