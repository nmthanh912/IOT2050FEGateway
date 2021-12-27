[root@localhost ~]# vi if_and.sh
#!/bin/bash
echo "Do you want to disable Node-red for better performance?? Yes (y) or No (n)"
read decision

if [[ ( $decision == "y") ]]; then
systemctl stop node-red
systemctl disable node-red
//systemctl status node-red
echo "------Node-red Stopped!!! Check by 'systemctl status node-red'-------"
else
systemctl start node-red
systemctl enable node-red
echo "------Node-red Started!!! Check by 'systemctl status node-red'-------"
fi



echo "Continue to install IOT2050FE Gateway?? Yes (y) or No (n)?"
read decision2

if [[ ( $decision2 == "y") ]]; then

sudo apt-get install curl software-properties-common 
curl -sL https://deb.nodesource.com/setup_16.x | sudo bash - 
sudo apt-get install nodejs
npm install
npm update

cp /var/www/IOT2050FEGateway/IOTgatewayservice.sh /usr/bin/IOTgatewayservice.sh
chmod +x /usr/bin/IOTgatewayservice.sh
cp /var/www/IOT2050FEGateway/IOTgatewayservice.service /lib/systemd/system/IOTgatewayservice.service
cp /var/www/IOT2050FEGateway/IOTgatewayservice.service /etc/systemd/system/IOTgatewayservice.service
chmod 644 /etc/systemd/system/IOTgatewayservice.service
systemctl start IOTgatewayservice
systemctl enable IOTgatewayservice
//systemctl status IOTgatewatservice
echo "------Installation finished!!!  Check by 'systemctl status IOTgatewayservice'--------"
else
echo "------Instalation cancelled!!!--------"
fi

