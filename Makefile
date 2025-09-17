# Variables (override via environment or make ARGS)
DOCKER_COMPOSE=docker compose
API_IMAGE=oncosaferx/api
GHCR_IMAGE?=ghcr.io/$(shell basename $(shell git rev-parse --show-toplevel))/$(shell basename $(shell git rev-parse --show-toplevel))
TAG?=latest
NODE_VERSION=20
DOMAIN?=yourdomain.com
EMAIL?=you@example.com

.PHONY: help install-backend install-frontend build-frontend dev-backend dev-frontend lint test format docker-build docker-up docker-down proxy-up proxy-down monitoring-up monitoring-down certbot-init k8s-apply k8s-destroy print-endpoints

help:
	@echo "Targets:"
	@echo "  install-backend     Install backend dependencies"
	@echo "  install-frontend    Install frontend dependencies"
	@echo "  build-frontend      Build React app"
	@echo "  dev-backend         Run backend dev server on :3001"
	@echo "  dev-frontend        Run frontend dev server on :3000"
	@echo "  lint/test/format    Code quality commands"
	@echo "  docker-build        Build Docker image"
	@echo "  docker-up/down      Run/Stop API container"
	@echo "  docker-login-ghcr   Login to GHCR (requires GHCR_USER/GHCR_TOKEN)"
	@echo "  docker-push-ghcr    Build and push to GHCR (GHCR_IMAGE, TAG)"
	@echo "  proxy-up/down       Run/Stop Nginx proxy with API"
	@echo "  monitoring-up/down  Run/Stop Prometheus+Grafana"
	@echo "  certbot-init        Obtain initial TLS certs via HTTP-01"
	@echo "  k8s-apply/destroy   Apply/Destroy Kubernetes manifests"
	@echo "  print-endpoints     Print key endpoints"

install-backend:
	npm ci

install-frontend:
	cd frontend && npm ci

build-frontend:
	cd frontend && npm ci && npm run build

dev-backend:
	PORT=3001 npm run dev

dev-frontend:
	cd frontend && REACT_APP_API_URL=http://localhost:3001/api npm start

lint:
	npm run lint --if-present

test:
	npm test --if-present

format:
	npm run format --if-present

docker-build:
	$(DOCKER_COMPOSE) build oncosaferx-api

docker-up:
	$(DOCKER_COMPOSE) up -d oncosaferx-api

docker-down:
	$(DOCKER_COMPOSE) down

docker-login-ghcr:
	@echo "Logging into GHCR as $(GHCR_USER)"
	echo "$(GHCR_TOKEN)" | docker login ghcr.io -u "$(GHCR_USER)" --password-stdin

docker-push-ghcr:
	@echo "Building and pushing $(GHCR_IMAGE):$(TAG)"
	docker buildx build --platform linux/amd64 -f Dockerfile -t $(GHCR_IMAGE):$(TAG) -t $(GHCR_IMAGE):latest --push .

proxy-up:
	$(DOCKER_COMPOSE) --profile proxy up -d nginx oncosaferx-api

proxy-down:
	$(DOCKER_COMPOSE) --profile proxy down

monitoring-up:
	$(DOCKER_COMPOSE) --profile monitoring up -d prometheus grafana oncosaferx-api

monitoring-down:
	$(DOCKER_COMPOSE) --profile monitoring down

certbot-init:
	@echo "Issuing certificate for $(DOMAIN)"
	docker run --rm -v "$(PWD)/ops/nginx/certs:/etc/letsencrypt" -v "$(PWD)/ops/nginx/www:/var/www/certbot" certbot/certbot certonly --webroot -w /var/www/certbot -d "$(DOMAIN)" --email "$(EMAIL)" --agree-tos --non-interactive

k8s-apply:
	kubectl apply -f k8s/deployment-api.yaml
	kubectl apply -f k8s/service-api.yaml
	kubectl apply -f k8s/ingress.yaml
	kubectl apply -f k8s/hpa.yaml
	kubectl apply -f k8s/pdb.yaml

k8s-destroy:
	kubectl delete -f k8s/pdb.yaml --ignore-not-found
	kubectl delete -f k8s/hpa.yaml --ignore-not-found
	kubectl delete -f k8s/ingress.yaml --ignore-not-found
	kubectl delete -f k8s/service-api.yaml --ignore-not-found
	kubectl delete -f k8s/deployment-api.yaml --ignore-not-found

print-endpoints:
	@echo "API: http://localhost:3000/health"
	@echo "Curated: http://localhost:3000/curated"
	@echo "Metrics: http://localhost:3000/metrics"
	@echo "Proxy: http://localhost/ (when proxy profile running)"
