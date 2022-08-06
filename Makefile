build_prod:
	docker-compose build configserver
	docker-compose build application
	docker-compose build mqttclient
	docker-compose build opc_ua
	docker-compose build modbustcp
	docker-compose build modbusrtu
	docker-compose build logger

publish:
	docker tag iot2050fegateway_logger:latest 1915940/logger:1.0
	docker push 1915940/logger:1.0
	
production_env:
	bash mode.sh production

development_env:
	bash mode.sh development

bootstrap:
	docker-compose -f docker-compose.dev.yml up -d

api_specs:
	cd APISpec; bash open.sh

node_server:
	cd NodejsApp; npm start

application:
	cd ReactApp; npm start