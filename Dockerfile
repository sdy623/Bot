FROM node:current-alpine3.15
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "."]

RUN npm install --production

COPY src ./src

CMD [ "npm", "run", "start" ]