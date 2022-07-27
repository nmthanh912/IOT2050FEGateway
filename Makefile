build_development:
	echo "build_development"
publish:
	echo "publish image to hub.docker.com"

switch_mode_production:
	bash mode.sh production
switch_mode_development:
	bash mode.sh development
bootstrap:
	docker-compose -f docker-compose.dev.yml up -d

api_specs:
	cd APISpec; bash open.sh