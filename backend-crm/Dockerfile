FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 8083

CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && npm start"]
