# Cách sử dụng API

## POST, PUT, DELETE data response

Các method POST, PUT, DELETE trả về kết quả thực thi **(KQTT)**, cụ thể là key của dữ liệu nếu thực thi thành công, ngược lại trả về error message:

```javascript
{
    key: '1h24a445',
}
```

hoặc

```javascript
{
    msg: 'Error message ...'
}
```

-------------

## Device

### API

\# | Method | URL | Description | Return
--|---|---|---|----
1 | GET | /devices | Lấy danh sách tất cả các device | Một array gồm các object chứa thông tin của device
2| POST | /device | Tạo mới một device. Dữ liệu gửi trong body bao gồm tên thiết bị và mô tả | KQTT
3| PUT | /device/:`id` | Chỉnh sửa thông tin một device có id cho trước.  Dữ liệu gửi trong body tương tự *POST* method | KQTT
4| DELETE | /device/:`id` | Xoá một device có id cho trước và mọi thông tin config liên quan | KQTT

### Parameters

Name | | Description
---|---|----
id | required | ID của thiết bị

### JSON data format

Response data format của API **\#1**:

```javascript
[
    {
        id: '1h24a445',
        name: 'Thiết bị PLC',
        description: 'Đo nhiệt độ, độ ẩm, nồng đọ CO2'
        status: 'unconfigured'
    },
    {
        id: '25z6e3a6',
        name: 'Thiết bị X',
        description: 'Đo áp suất'
        status: 'configured'
    },
    ...
]
```

Body data format của API **\#2** và **\#3**:

```javascript
{
    name: 'Thiết bị PLC',
    description: 'Đo nhiệt độ, độ ẩm, nồng đọ CO2'
}
```

## Tag

### API

\# | Method | URL | Description | Return
--|---|---|---|----
1 | GET | /tags | Lấy danh sách tất cả các tag | Một array gồm các object chứa thông tin của tag. Các object này khác nhau về mặt cấu trúc.
2|POST | /tag | Tạo một tag mới. Dữ liệu gửi trong body bao gồm tên tag và một JSON object chứa dữ liệu của tag. | KQTT
3|PUT | /tag/:`id` |Sửa một tag với ID cho trước. Dữ liệu gửi trong body tương tự *POST* method. | KQTT
4|DELETE | /tag/:`id` | Xoá một tag với ID cho trước | KQTT

### Parameters

Name | | Description
--|---|----
id | required | ID của tag

### JSON data format

Response data format của API **\#1**:

```javascript
[
    {
        id: '1h24a445',
        name: 'Tag đo nhiệt độ',
        data: {
            key1: 'value 1',
            key2: 'value 2',
            ... // Dữ liệu của tag
        }
    },
    {
        id: '25z6e3a6',
        name: 'Tag đo độ ẩm',
        data: {
            ... // Dữ liệu của tag
        }
    },
    ...
]
```

Body data format của API **\#2** và **\#3**:

```javascript
{
    name: 'Tag đo độ ẩm',
    data: {
        key1: 'value 1',
        key2: 'value 2',
        ... // Dữ liệu của tag
    }
}
```

## Protocol

### API

\# | Method | URL | Description | Return
--|---|---|---|----
1|GET|/protocols|Lấy danh sách tất cả các loại protocol|Một array gồm các object chứa thông tin của protocol
2|POST|/protocol|Thêm một loại protocol mới. Dữ liệu gửi trong body bao gồm tên protocol và danh sách các thông tin cần config khi sử dụng protocol đó. | KQTT
3| PUT|/protocol/:`name`|Cập nhật thông tin của một protocol có tên cho trước. Dữ liệu gửi trong body tương tự *POST* method| KQTT
4|DELETE|/protocol/:`name`|Xoá một protocol bằng tên. Các config sử dụng protocol cũng bị xoá theo.|KQTT

### Parameters

Name | | Description
--|---|----
name | required | Tên của loại protocol

### JSON data format

Response data format của API **\#1**:

```javascript
[
    {
        name: 'OPC_UA',
        attrList: [{
            name: 'URL',
            type: String
        }]
    },
    {
        name: 'ModbusTCP',
        attrList: [
            {
                name: 'IP',
                type: String
            }, 
            {
                name: 'Port',
                type: Number
            }, 
            {
                name: 'Slave',
                type: Number
            }
        ]
    },
    ...
]
```

Body data format của API **\#2** và **\#3**:

```javascript
{
    name: 'ModbusTCP',
    attrList: [
        {
            name: 'IP',
            type: String
        }, 
        {
            name: 'Port',
            type: Number
        }, 
        {
            name: 'Slave',
            type: Number
        }
    ]
}
```

## Configuration

### API

\# | Method | URL | Description | Return
--|------|-----|----|-------
1|GET|/configs|Lấy danh sách tất cả các config và thông tin liên quan|Một array chứa các object về thông tin config
2|POST|/config|Tạo một config mới. Dữ liệu gửi trong body bao gồm ID của thiết bị, danh sách ID của các tag, tên protocol sử dụng và một object chứa các thông tin tương ứng với loại protocol đã chọn | KQTT
3|PUT|/config/:`deviceId`|Chỉnh sửa 1 config. Dữ liệu gửi trong body tương tự *POST* method.|KQTT
4|DELETE|/config/:`deviceId`|Xoá một config gắn với device cụ thể|KQTT

### Parameters

Name | | Description
--|---|----
deviceId | required | ID của thiết bị

### JSON data format

Response data format của API **\#1**:

```javascript
[
    {
        device: {
            id: '1h24a445',
            name: 'Thiết bị PLC'
        },
        tag: [
            {
                id: 'qm5kq6q9',
                name: 'Tag đo nhiệt độ'
            },
            {
                id: 'za6w8x26',
                name: 'Tag đo độ ẩm'
            }
            ... // Danh sách các tag
        ],
        protocol: 'ModbusTCP',
        configData: {
            IP: '192.168.10.2',
            port: 3000,
            slave: 105
        }
    },
    ... 
]
```
