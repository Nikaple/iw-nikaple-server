FROM registry.docker-cn.com/library/node:9.11.1

LABEL maintainer="Nikaple <nikaple1@gmail.com>"

RUN mkdir -p /app
WORKDIR /app

COPY package.json yarn.lock /app/

RUN npm install -g pm2 --registry=https://registry.npm.taobao.org --loglevel=error
RUN yarn --registry https://registry.npm.taobao.org

COPY . /app

EXPOSE 3738/tcp
EXPOSE 3738/udp

CMD ["yarn", "docker:dev"]