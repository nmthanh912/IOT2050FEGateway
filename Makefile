build_prod:
	docker-compose build configserver
	docker-compose build application
	docker-compose build mqttclient
	docker-compose build opc_ua
	docker-compose build modbustcp
	docker-compose build modbusrtu
	docker-compose build logger

publish:
	docker tag

switch_mode_production:
	bash mode.sh production

switch_mode_development:
	bash mode.sh development

bootstrap:
	docker-compose -f docker-compose.dev.yml up -d

api_specs:
	cd APISpec; bash open.sh

node_server:
	cd NodejsApp; npm start

application:
	cd ReactApp; npm start