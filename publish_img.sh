if [[ -z $1 ]]; then
    echo "Error: Missing semantic versioning parameter"
    exit 1
fi

docker commit btcsql eegli/btcsql:$1
docker image push eegli/btcsql:$1