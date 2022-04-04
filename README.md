
# Description of project source code

Our project uses microservice architecture, with each folder contains source code of a service.

In this repo, we have ReactApp folder, which contains source code of web application and NodejsApp, which contains source code of configuration server. The other folders contain source code of remoting device, reading data and sending to other end users. These folders are differentiated by which protocol using.

We are appreciated if you help us by reporting bugs, leaving comments or contribute to this project.

All services, except ReactApp, communicate to each others by using Redis Pub/Sub mechanisim. You can look over this naive [example](https://github.com/phucvinh57/RedisPubSub-Example) to have a similar view of our architecture.

## Development testing

In the root directory of this repo, create two empty folders `Database` and `customJSON`

After that, go to each directory and run the `index.js` file by command:

```console
node index.js
```

As you can see, we have many processes running now:

- The ReactApp process run web application on port 3000. It provides GUI to user for configuring and remoting the entire system.
- The NodejsApp process are listening on port 4000, will handle all CRUD function for saving data of device configuration.
- The other processes are listen on other ports, has their own roles up to the specific protocol which they use.

# Usage guideline

# Deployment guideline

This project must be deployed on Linux operating system.
Please install **docker**, **docker-compose** before deploying.

In the project directory, run the command below to build and run all images in background mode:

```console
docker-compose up -d --build
```

If you want to stop the entire system (include volume), run this command:

```command
docker-compose down --volume
```

