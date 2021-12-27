# Tài liệu hướng dẫn sử dụng

## Mục đích của tài liệu

-   Giúp cho người dùng là đối tượng mới tiếp cận đến lĩnh vực IoT hoặc những người không chuyên về IT có thể tra cứu
    nhanh và dễ dàng áp dụng IOT2050 vào dự án.
-   Tài liệu này có thể được sử dụng trong quá trình sử dụng phần mềm hoặc dùng để tìm hiểu trước khi sử dụng phần mềm.
-   Nếu trong tài liệu còn những vấn đề trong quá trình người dùng sử dụng gặp phải nhưng không được đề cập đến hãy liên
    hệ đến địa chỉ email sau: nmthanh09012@gmail.com hoặc daoducthanh0101@gmail.com.

## Thông tin chung

Phần mềm IOT2050 FE – tên đầy đủ là SIMATIC IOT2050 For Everyone, được trực tiếp thực hiện và phát triển bởi EZ Team,
bao gồm 2 hệ:

-   IOT2050 FE Gateway được cài đặt trên IOT2050.
-   IOT2050 FE Server được cài đặt trên một máy Linux.

## Thông tin kỹ thuật

-   IOT2050 FE là gói cài đặt trên IOT2050, sau khi cài đặt lên IOT2050 có thể truy cập vào địa chỉ của IOT2050 để cài
    đặt thông tin cho các thiết bị cần thu thập dữ liệu.
-   IOT2050 FE có chế độ lưu trữ dữ liệu để đảm bảo an toàn dữ liệu.

## Cài đặt gói IOT2050 FE trên hệ điều hành Linux của IOT 2050

Bước đầu, tiến hành cài đặt để sử dụng IOT2050:

-   Kiểm tra thẻ nhớ trước khi sử dụng.
-   Tải hệ điều hành cho SIMATIC IOT2050.
-   Ghi hệ điều hành vào thẻ nhớ và kiểm tra.
-   Kết nối trực tiếp đến SIMATIC IOT2050 với tài khoản, mật khẩu và địa chỉ IP mặc định.
-   Cài đặt địa chỉ IP simatic IOT2050, kết nối Internet.
-   Update SIMATIC IOT2050.
-   Update phần mềm trên IOT2050.

Sau khi đã cài đặt xong cho IOT2050, sử dụng SSH Client để truy cập vào IOT2050 và tiến hành cài đặt hệ IOT2050 FE
Gateway:

1. Tiến hành Update Nodejs, npm đến phiên bản cao nhất.
2. Copy Source Code vào một thư mục trên hệ thống IOT2050.
3. Truy cập theo đường dẫn để vào hệ và chạy dòng lệnh npm install trên terminal.
4. Truy cập theo đường dẫn để vào hệ và chạy dòng lệnh node index.js trên terminal.
5. Open port trên Linux để đảm báo truy cập từ các máy khác để tiến hành cài đặt: `ufw allow PORT`
6. Cài đặt khởi chạy hệ tự động mỗi khi khởi động IOT2050:

-   **Tạo một tập lệnh hoặc một tệp lệnh thực thi** `my_service.sh` **trong thư mục** `/usr/bin/` **như sau với đường
    dẫn sau cd là đường dẫn nơi đặt source code của hệ IOT2050 FE Gateway.**

![2 1 1](https://user-images.githubusercontent.com/84150448/140943464-8a7c0e7e-47bc-4682-aa3d-1674429dbe04.png)

```php
cd /var/www/IOTGateway_Final
node index.js
```

-   **Thay đổi cài đặt để cấp quyền thực thi cho file vừa tạo:**

```php
chmod +x /usr/bin/my_service.sh
```

-   **Tạo tệp đơn vị myservice.service để thiết lập Service trong hệ thống theo đường dẫn:**

```php
/lib/systemd/system/myservice.service
```

![2 1 2](https://user-images.githubusercontent.com/84150448/140943475-9cb21de3-8f63-4137-aa3b-a9e8af8dc216.png)

```php
[Unit]
Description=Example systemd service.

[Service]
Type=simple
ExecStart=/bin/bash /usr/bin/my_service.sh

[Install]
WantedBy=multi-user.target
```

-   **Sao chép tệp đơn vị vào** `/etc/systemd/system` **và cấp cho nó quyền khởi chạy:**

```php
cp myservice.service/etc/systemd/system/myservice.service
chmod 644 /etc/systemd/system/myservice.service
```

-   **Khởi chạy và kích hoạt Service:**

**Kiểm tra service:**

```php
systemctl start myservice
```

**Kiểm tra trạng thái service:**

```php
systemctl status myservice
```

**Ngừng hoặc restart service:**

```php
// Stop Service
systemctl stop myservice
// Restart Service
systemctl restart myservice
```

**Cho phép khởi chạy Service:**

```php
systemctl enable myservice
```

## Sử dụng các chức năng phần mềm

### Đăng nhập cài đặt:

Truy cập vào địa chỉ của IOT2050 với port mặc định `4000` để kiểm tra đã chạy thành công gói cài đặt. Trong trường hợp
này, IOT đang chạy DHCP với địa chỉ được cấp là `192.168.1.6`. Nếu ở chế độ IP tĩnh, cần set địa chỉ IP sao cho về cùng
lớp mạng với máy tính hiện đang sử dụng.

<img src="https://user-images.githubusercontent.com/84150448/141161263-ae63ef64-8217-4945-86e6-3e5510f1ff09.png" alt="drawing" width="800"/>

### Cài đặt thông tin cho các thiết bị thu thập dữ liệu:

-   **Bước 1:** Ở thanh sidebar bên trái chọn giao thức sử dụng, sau đó chọn **“Device”** để cài đặt thông tin thiết bị.
    Chọn **“Add device”** điền đầy đủ thông tin thiết bị, sau đó chọn **“Add new”** để cập nhật thông tin thiết bị.

<img src="https://user-images.githubusercontent.com/84150448/140858855-bb12e1f4-257e-4cda-8495-c32a005dfc9f.png" alt="drawing" width="800"/>

-   **Bước 2:** Sau khi cài đặt thông tin cho thiết bị ta chọn **“Tag”** để cài đặt thông tin cho các giá trị cần đọc.
    Chọn **“Add new tag”** điền đầy đủ thông tin của giá trị cần đọc, sau đó chọn **“Add new”** để cập nhật thông tin.

<img src="https://user-images.githubusercontent.com/84150448/140858859-b4c5a5a0-46cd-4e9d-9872-ef74597dae45.png" alt="drawing" width="800"/>

### Cài đặt MQTT Broker:

Sau khi cài đặt thành công thông tin người dùng và giao thức sử dụng, các dữ liệu thu thập được từ IOT2050 sẽ được gửi
đi thông qua MQTT Broker để phía server có thể nhận và xử lý các dữ liệu này:

-   **Bước 1:** Ở thanh sidebar bên trái chọn **“MQTT”**, sau đó chọn **“Broker”**.
-   **Bước 2:** Nhấn chọn **“Add broker”** ở góc bên trái bảng, điền đầy đủ thông tin sau đó nhấn chọn **“Add new”**.

<img src="https://user-images.githubusercontent.com/84150448/140858863-a1a6b48d-b9a9-4486-8c36-5edc08399a92.png" alt="drawing" width="800"/>

### Cập nhật, sửa đổi thông tin đã cài đặt:

Các bước thực hiện sửa đổi thông tin thiết bị, giá trị cần đọc hoặc MQTT Broker là giống nhau. Ở đây sẽ hướng dẫn cách
sửa đổi thông tin thiết bị của giao thức Modbus TCP/IP:

-   **Bước 1:** Ở thanh sidebar bên trái chọn **“Modbus TCP/IP”**, sau đó chọn **“Device”**.
-   **Bước 2:** Chọn **“Edit”** ở cột **“Action”**, cập nhật các thông tin cần sửa đổi, sau đó chọn **“Save changes”**
    để lưu thay đổi.

<img src="https://user-images.githubusercontent.com/84150448/140858864-789f1e28-1ddc-4ef2-b94f-98bbab5403ac.png" alt="drawing" width="800"/>

### Xóa các thông tin không còn sử dụng:

Cách thực hiện xóa bỏ các dữ liệu không còn sử dụng nữa như thông tin thiết bị, thông tin các giá trị cần đọc hoặc MQTT
Broker ta chỉ cần nhấn chọn **“Delete”** ở cột **“Action”** tương ứng với hàng cần xóa.

<img src="https://user-images.githubusercontent.com/84150448/140860275-5201fb88-714d-460f-9ed1-ef2d8230c5cd.png" alt="drawing" width="800"/>

### Tải xuống các dữ liệu thu thập được:

Các dữ liệu thu thập được từ IOT2050 sẽ được lưu dưới dạng file `.csv` để người dùng có thể dễ dàng tải về khi cần
thiết.

-   **Bước 1:** Ở thanh sidebar bên trái chọn **“Home”**, sau đó chọn **“Report”**.
-   **Bước 2:** Nhấn chọn **“Download”** ở cột **“Action”** file cần download.

<img src="https://user-images.githubusercontent.com/84150448/140858867-2fd45682-e0a7-4053-9dbb-4f8b22a10cb3.png" alt="drawing" width="800"/>

## Cài đặt hệ IOT2050 FE Server

### Cài đặt hệ thống trên Ubuntu Desktop

1. Tiến hành Update Nodejs, npm đến phiên bản cao nhất, cài đặt Database MongoDB và tiến hành thiết
   lập Database để lưu trữ dữ liệu từ hệ thống.
2. Hệ IOT2050 FE Server sẽ gồm 3 phần chính: MQTT Broker, API để trao đổi dữ liệu và Grafana dùng để hiển thị dữ liệu
   trên các biểu đồ.

### Cài đặt MQTT Broker và API (SaveonDB_API)

**1. Copy Source Code vào thư mục bất kì (ví dụ ở đây sẽ đặt các hệ trên trên Desktop).**

![2 3 1](https://user-images.githubusercontent.com/84150448/140960698-96f51c63-fa9a-4c90-ae05-1d1414887c7d.png)

**2. Open Terminal ở mỗi hệ, chạy lệnh** `pwd` **để lấy đường dẫn:**

![2 3 2](https://user-images.githubusercontent.com/84150448/140951719-0fda2eec-5b35-4f18-a90f-c54c7f0c75c2.png)

**3. Với mỗi hệ MQTT Broker và API, ta truy cập theo đường dẫn vào mỗi hệ, chạy dòng lệnh** `npm install` **và**
`node index` **để khởi chạy.** 

**4. Cài đặt các thông số cho MQTT Broker:**

-   Tạo file `.env` và tiến hành cài đặt các thông số của MQTT Broker theo dòng lệnh:

```php
sudo nano /home/iot2050feserver/Desktop/IOT2050FE_Server/IOT2050FE_Server_MQTT_Broker/.env
```

![2 3 3](https://user-images.githubusercontent.com/84150448/140951723-1101a7e0-1255-4285-9564-27d7f815092c.png)

-   Tiến hành chỉnh sửa các thông số: **Port**, **username** và **password của Broker**, `Ctrl + S` để lưu thay đổi.
-   Tiến hành khởi động lại hệ thống để áp dụng thay đổi.

**5. Cài đặt thông số cho API và thiết lập kết nối đến MongoDB được khởi tạo:**

-   Tạo file `.env` và tiến hành cài đặt các thông số của API và MongoDB Url theo dòng lệnh:

```php
sudo nano /home/iot2050feserver/Desktop/IOT2050FE_Server/IOT2050FE_Server_SaveonDB_API/.env
```

-   Tiến hành chỉnh sửa các thông số PORT để get API và MongoDB_Url.

![2 3 4](https://user-images.githubusercontent.com/84150448/140951725-42aed973-8dc0-4202-98bb-6839bc15bc77.png)

**6. Cài đặt khởi chạy hệ tự động mỗi khi khởi động:**

-   Tạo một tập lệnh hoặc một tệp lệnh thực thi `myservice.sh` (cho MQTT_Broker) và `myservice2.sh` (cho API và lưu trữ
    vào MongoDB) trong thư mục `/usr/bin/` như sau với đường dẫn sau `cd` là đường dẫn nơi đặt source code của hệ
    IOT2050 FE Gateway.

![2 3 5](https://user-images.githubusercontent.com/84150448/140951730-8e63bcc9-ca24-46ec-a07d-80d9e5292e40.png)

```php
// For Broker:
cd /home/iot2050feserver/Desktop/IOT2050FE_Server_MQTT_Broker
node index.js
// For API and DB
cd /home/iot2050feserver/Desktop/IOT2050FE_Server_SaveonDB_API
node index.js
```

-   Thay đổi cài đặt để cấp quyền thực thi cho file vừa tạo:

```php
chmod +x /usr/bin/myservice.sh
chmod +x /usr/bin/myservice2.sh
```

-   Tạo tệp đơn vị `myservice.service` và `myservice2.service` để thiết lập Service cho 2 hệ trong hệ thống theo đường
    dẫn:

```php
/lib/systemd/system/myservice.service
```

![2 3 6](https://user-images.githubusercontent.com/84150448/140951734-4fe48749-0219-429b-aba3-bef94b23ae56.png)

![2 3 7](https://user-images.githubusercontent.com/84150448/140951737-14aa529d-6b02-4dac-a3f9-8df589513108.png)

```php
[Unit]
Description=Example systemd service.

[Service]
Type=simple
ExecStart=/bin/bash /usr/bin/myservice //(myservice2)

[Install]
WantedBy=multi-user.target
```

-   Sao chép tệp đơn vị vào `/etc/systemd/system` và cấp cho nó quyền khởi chạy:

```php
cp myservice.service /etc/systemd/system/myservice.service
cp myservice2.service /etc/systemd/system/myservice.service
chmod 644 /etc/systemd/system/myservice.service
chmod 644 /etc/systemd/system/myservice2.service
```

**7. Khởi chạy và kích hoạt Service:**

**Kiểm tra service:**

```php
systemctl start myservice/ systemctl start myservice2
```

**Kiểm tra trạng thái service:**

```php
systemctl status myservice/ systemctl status myservice2
```

**Ngừng hoặc restart service:**

```php
// Stop Service
systemctl stop myservice/ systemctl stop myservice2
// Restart Service
systemctl restart myservice/ systemctl restart myservice2
// Lưu ý: cần restart service khi có sự thay đổi trong hệ thống
```

**Cho phép khởi chạy Service:**

```php
systemctl enable myservice/ systemctl enable myservice2
```

### Cài đặt Grafana

**1. Chạy các dòng lệnh sau:**

```php
sudo apt-get install -y apt-transport-https
sudo apt-get install -y software-properties-common wget
wget -q -O - https://packages.grafana.com/gpg.key | sudo apt-key add –
```

**2. Thêm kho lưu trữ này cho các bản phát hành ổn định:**

```php
echo "deb https://packages.grafana.com/enterprise/deb stable main" | sudo tee -a /etc/apt/sources.list.d/grafana.list
```

**3. Chạy để update Grafana:**

```php
sudo apt-get update
sudo apt-get install grafana-enterprise
```

**4. Khởi động server:**

```php
sudo systemctl daemon-reload
sudo systemctl start grafana-server
sudo systemctl status grafana-server
```

**5. Cài đặt Grafana Service cho máy:**

```php
sudo systemctl enable grafana-server.service
```

### Thay đổi port mặc định

Grafana sau khi cài đặt sẽ được chạy mặc định trên port 3000. Để thay đổi port mặc định, ta thực hiện các bước sau:  
**1. Truy cập vào đường dẫn:**

```php
cd usr/share/grafana/conf/
```

**2. Thực hiện thay đổi trong file** `defaults.ini` **ở phần port, thay đổi bằng port muốn khởi chạy Grafana.**

![2 3 8](https://user-images.githubusercontent.com/84150448/140951740-5e56858e-661d-42fc-b8bb-e6d8f68b6236.png)

**3. Khởi động lại Grafana để áp dụng những thay đổi cài đặt:**

```php
sudo systemctl restart grafana-server
```

## Sử dụng Grafana để view biểu đồ các dữ liệu cơ bản

Trong Grafana có hỗ trợ một Data Source là Infinity để view các dữ liệu dưới dạng JSON ra các biểu đồ, vậy nên các hướng
dẫn dưới đây sẽ giúp ta dễ dàng view dữ liệu dưới dạng các biểu đồ để từ đó hiển thị các dữ liệu được lấy từ API một
cách trực quan.

### Cài đặt Data Source Infinity trong Grafana

**Cài đặt Data Source Infinity bằng cách chạy dòng lệnh sau:**

```php
grafana-cli plugins install yesoreyeram-infinity-datasource
```

**Khởi động lại Grafana để áp dụng những thay đổi cài đặt:**

```php
sudo systemctl restart grafana-server
```

### Khởi động Grafana và cài đặt Infinity Datasource

Port mặc định của Grafana khi khởi động sẽ là **3000**. Truy cập vào `x.x.x.x:3000` để truy cập vào Grafana, với
`x.x.x.x` là địa chỉ IP của thiết bị đang khởi chạy hệ IOT2050FE_Server. Trong lần đầu tiên đăng nhập, Grafana sẽ yêu
cầu tên đăng nhập và mật khẩu, ta sẽ nhập cả 2 là admin, sau đó hệ thống yêu cầu đổi mật khẩu. Tiếp tục thực hiện đổi
mật khẩu để truy cập vào trang chủ của Grafana.

<img src="https://user-images.githubusercontent.com/84150448/141312885-aaab0d87-e21c-4ac4-82b6-63af6e74db00.jpg" alt="drawing" width="800"/>

**Cài đặt Infinity data source:**

-   Vào cài đặt, chọn **datasource**. Giao diện hiển thị ra như sau:

<img src="https://user-images.githubusercontent.com/84150448/141315451-d814056c-8a7b-4fec-a334-abb3e9f2e94c.png" alt="drawing" width="800"/>

<img src="https://user-images.githubusercontent.com/84150448/141315457-81ba31ee-0881-4d3c-90b9-9488e17531ca.png" alt="drawing" width="800"/>
 
* Chọn **Add data source** rồi chọn **Infinity**.

<img src="https://user-images.githubusercontent.com/84150448/141317378-7706e2ec-fa9d-4b05-a85d-8b366bc19a0f.png" alt="drawing" width="800"/>
 
* Nhấn **Save** và **test**, nếu nhận được thông báo **Datasource Updated** thì ta đã cài đặt thành công.

### Tạo các biểu đồ để view dữ liệu

**Các thành phần cơ bản khi tạo biểu đồ:**

-   Trỏ vào kí hiệu dấu cộng (+), chọn **Dashboard**. Trong mục khung **add panel**, chọn **Add an empty Panel**. Khi đó
    giao diện để xây dựng dashboard sẽ hiện lên:

<img src="https://user-images.githubusercontent.com/84150448/141317893-221e0297-db50-4d40-80fc-a65e21f39d60.png" alt="drawing" width="800"/>

<img src="https://user-images.githubusercontent.com/84150448/141147356-aa012f4b-1ba2-4777-8a3d-5dc27c199d0c.png" alt="drawing" width="800"/>
 
* **Table view:** hiển thị dữ liệu nhận được từ data source dưới dạng bảng hoặc các dạng khác (biểu đồ tròn, đường,… ) khi xây dựng Dashboard trong lúc demo.
* **Refresh:** Refresh lại data đến thời điểm hiện tại.

![2 4 3 2](https://user-images.githubusercontent.com/84150448/141147361-af8af691-f3a4-4605-836d-46c691a0b5b9.png)

-   **Data source:** Do dữ liệu hiển thị được lấy từ API do đó ở đây ta sử dụng Data source Infinity (tên hiển thị theo
    tên khi cài đặt data source ở bước trên).
-   **Format:** Điều chỉnh dashboard của bạn ở chế độ nào? (Table? Time Series?...).
-   **URL:** đường dẫn dẫn đến API dữ liệu.

![2 4 3 3](https://user-images.githubusercontent.com/84150448/141147365-dc15fda3-6f33-4a86-8ea8-4fd19fa850a0.png)

-   **Visualization:** Thay đổi cách thức hiển thị dashboard (Table, Bar Chart, Line Graph,… ).

![2 4 3 4](https://user-images.githubusercontent.com/84150448/141147369-8a706f46-a65c-4e42-8d5f-50a65e21b975.png)

### Xây dựng biểu đồ dạng bảng

**Dữ liệu mẫu:**

<img src="https://user-images.githubusercontent.com/84150448/141319167-75159739-19e5-4e77-87d6-092c689ff4aa.png" alt="drawing" width="800"/>

<img src="https://user-images.githubusercontent.com/84150448/141319173-1b80e852-f917-43cd-b464-6aeafb9883e0.png" alt="drawing" width="800"/>
 
* Khi tạo dashboard, nên bật chế độ Table view để có thể quan sát và quản lý được dữ liệu cần hiển thị. **Visualization**, chọn **Table**.
* Nhập URL đường dẫn dữ liệu, các cột cần hiển thị dữ liệu, tên cột và loại dữ liệu.
* **Row/Root** dùng trong trường hợp ta lấy dữ liệu từ một mảng hay một object con trong một mảng hay object chính, bằng cách nhập tên của mảng hay object đó. Khi truy vấn cột, ta vẫn truy vấn theo tên như bình thường. Để hiểu rõ hơn, bạn có thể truy cập vào Infinity Datasource của Grafana và làm theo các hướng dẫn.
* Nhấn **Apply** để hiển thị bảng dữ liệu trên Dashboard chính và tiến hành lưu.

**Kết quả:**

<img src="https://user-images.githubusercontent.com/84150448/141319177-69f7583c-dbca-44ca-9ae1-693c39c36e5c.png" alt="drawing" width="800"/>
 
### Xây dựng biểu đồ dạng đường biểu diễn
**Dữ liệu mẫu:**

<img src="https://user-images.githubusercontent.com/84150448/141319179-4e9d911a-4c80-47f9-ba32-0964ca74a77a.png" alt="drawing" width="800"/>

<img src="https://user-images.githubusercontent.com/84150448/141319182-693ff405-6bd2-429a-8cc0-1e845e488e93.png" alt="drawing" width="800"/>
 
* Khi tạo dashboard, nên bật chế độ Table view để có thể quan sát và quản lý được dữ liệu cần hiển thị.
* **Visualization**, chọn **Graph (old)**.
* Nhập URL đường dẫn dữ liệu, các cột cần hiển thị dữ liệu, tên cột và loại dữ liệu. Dữ liệu lúc này sẽ gồm 2 phần chính. Một là thời gian. Hai là các dữ liệu tương ứng với thời gian đó. Do đó, trong quá trình thêm cột cần để ý loại dữ liệu tương ứng là **Number** (cho dữ liệu) và **timestamp** (cho thời gian biểu thị).
* Nếu trong cùng **timestamp** có nhiều dữ liệu khác nhau ta hoàn toàn có thể hiển thị trên cùng một đồ thị bằng cách thêm các cột dữ liệu khác.
* Tắt chế độ **Table view** để hiển thị hệ thống dưới dạng biểu đồ ta đang muốn quan sát.
* Nhấn **Apply** để hiển thị bảng dữ liệu trên Dashboard chính và tiến hành lưu.

**Kết quả:**

<img src="https://user-images.githubusercontent.com/84150448/141319186-4580834d-6e0d-447c-a818-8f444783aa9f.png" alt="drawing" width="800"/>

## Giải quyết các sự cố thường gặp

### Không truy cập được đến giao diện web khi cài đặt IOT2050

<img src="https://user-images.githubusercontent.com/84150448/141161949-8861fd64-c851-49ea-bb72-c1edc21a71c4.png" alt="drawing" width="800"/>

Khi bạn không truy cập được đến giao diện cài đặt như hình trên thì nguyên nhân có thể đến do:

-   Bạn gõ chưa đúng địa chỉ của IOT2050: Hãy kiểm tra và chắc chắn rằng bạn đã truy cập đúng địa chỉ IP và Port của
    IOT2050. Với chế độ DHCP, máy tính kết nối gián tiếp thông qua Router mạng, hãy sử dụng một phần mềm (như Advanced
    IP Scanner) để tiến hành quét địa chỉ IP của IOT. Còn nếu trong trường hợp kết nối IOT trực tiếp đến máy tính, bạn
    cần đưa máy tính hoặc IOT2050 về cùng lớp mạng thì mới có thể truy cập vào web cài đặt.
-   Nếu địa chỉ đã đúng nhưng vẫn không truy cập được, bạn có thể kiểm tra liệu port trong IOT đã được mở hay chưa? Bạn
    có thể truy cập putty để kết nối vào IOT và gõ lệnh sau (4000 là port mặc định của hệ FE Gateway):

```php
sudo ufw allow 4000
```

**Nâng cao:** Đôi khi, trong quá trình xây dụng và tạo service trên IOT2050, do một số nguyên nhân khiến service không
hoạt động. Để kiểm tra, bạn cần kiểm tra status của service (như hướng dẫn trên). Nếu Service vẫn hoạt động (running)
thì re-check lại các port và địa chỉ của IOT xem có sai sót gì không. Nếu không hoạt động, thì nguyên nhân có thể đến từ
các yếu tố sau đây:

-   **Thứ nhất**, IOT2050 của bạn chưa được update nodejs và npm đến version cao nhất. Điều này sẽ khiển một số module
    được phát triển trong dự án sẽ không thể hoạt động, từ đó sinh ra lỗi khiến hệ Gateway không hoạt động. Để kiểm tra
    bạn có thể gõ dòng lệnh node -v. Nếu phiên bản hiện ra không phải 16.x.x (là phiên bản hiện tại khi docs này được
    viết) thì quá trình Update Nodejs và npm đã không thành công. Bạn cần tiến hành update lại.
-   **Thứ hai**, trong trường hợp các phiên bản Node và npm đã được update mà hệ vẫn không hoạt động, bạn sẽ cần một
    chuyên gia về IT để giúp bạn khắc phục. Do lỗi này có thể đến từ lỗi phát sinh khi cài các hệ điều hành khác nhau,
    v.v …

_Lưu ý:_  
Sau khi có sự thay đổi trong hệ thống, bạn cần kiểm tra trạng thái của service đã trở về bình thường hay chưa? Nếu rồi,
hãy tiến hành restart service để đảm bảo những sự thay đổi đã thực hiện sẽ được apply vào hệ thống.

### Không đọc được các giá trị trên IOT2050FE Gateway

<img src="https://user-images.githubusercontent.com/84150448/141163310-88d32192-af34-4197-97ef-b0c201c5f91c.png" alt="drawing" width="800"/>

Sau khi đã đăng nhập thành công vào hệ thống và điền đầy đủ các thông tin giao thức sử dụng, thông tin thiết bị cũng như
thông tin các giá trị cần đọc nhưng cột **“Value”** vẫn không cập nhật giá trị thì nguyên nhân có thể là do thông tin
các giá trị này chưa được hệ thống cập nhật. Bạn có thể tắt hệ thống và cho IOT khởi động lại.
