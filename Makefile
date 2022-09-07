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

	docker tag iot2050fegateway_modbustcp:latest 1915940/modbustcp:1.0
	docker push 1915940/modbustcp:1.0

	docker tag iot2050fegateway_modbusrtu:latest 1915940/modbusrtu:1.0
	docker push 1915940/modbusrtu:1.0

	docker tag iot2050fegateway_opc_ua:latest 1915940/opc_ua:1.0
	docker push 1915940/opc_ua:1.0

	docker tag iot2050fegateway_application:latest 1915940/application:1.0
	docker push 1915940/application:1.0

	docker tag iot2050fegateway_mqttclient:latest 1915940/mqttclient:1.0
	docker push 1915940/mqttclient:1.0

	docker tag iot2050fegateway_configserver:latest 1915940/configserver:1.0
	docker push 1915940/configserver:1.0
	
production_env:
	bash mode.sh production

development_env:
	bash mode.sh development

bootstrap:
	docker-compose -f docker-compose.dev.yml up -d
	mkdir Database
	mkdir customJSON
	mkdir deviceStates
	cd deviceStates; touch modbusTCP.txt; touch modbusRTU.txt; touch opc_ua.txt; touch mqtt.txt
downstrap:
	docker-compose -f docker-compose.dev.yml down

api_specs:
	cd APISpec; bash open.sh

node_server:
	cd NodejsApp; npm start

application:
	cd ReactApp; npm start

modbustcp:
	cd ModbusTCP ; npm start

modbusrtu:
	cd ModbusTCP ; npm start

opc_ua:
	cd OPC_UA ; npm start

mqttclient:
	cd MQTTClient ; npm start

clean:
	docker rmi $(docker images --filter "dangling=true" -q --no-trunc)