FROM mysql:latest

WORKDIR /src

RUN npm install

COPY dist ./dist

EXPOSE 9090