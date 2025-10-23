#!/bin/bash
container_name="fmo-web"
docker pull ghcr.io/tallcode/${container_name}:latest

container_exists=$(docker ps -a --filter "name=${container_name}" --format '{{.Names}}')
if [ -n "$container_exists" ]; then
    docker container stop ${container_name}
    docker container rm ${container_name}
fi    

docker run --restart=always -p 80:8080 -p 443:8043 -v /root/fmo-web/.env:/app/.env -v /root/fmo-web/cert:/app/cert --name ${container_name} -d ghcr.io/tallcode/${container_name}:latest