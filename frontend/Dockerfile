# Stage 1: Build Angular app
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
RUN node_modules/.bin/ng build --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=build /app/dist/quiz-frontend /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
