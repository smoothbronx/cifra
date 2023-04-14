FROM node:18-alpine

WORKDIR /user/src/integration/backend

COPY ./package*.json .
RUN npm install --force

COPY . .

CMD ["npm", "run", "start:debug"]
