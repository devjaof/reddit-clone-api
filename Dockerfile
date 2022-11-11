FROM mysql:latest

RUN docker run --name reddit-clone-db -d \
    -p 9090:9090 \
    -e MYSQL_ROOT_PASSWORD=root \
    --restart unless-stopped \
    mysql:8

WORKDIR /src

EXPOSE 9090