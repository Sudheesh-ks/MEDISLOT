# Stage 1
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Stage 2

FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tzdata
ENV TZ=Asia/Kolkata

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 4000

CMD ["npm", "start"]