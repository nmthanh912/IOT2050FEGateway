
# Description of project source code

Our project uses microservice architecture, with each folder is a subproject implementing a service.

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

We have prebuilt all images and push to a [repository](https://hub.docker.com/r/nguyenthanh912/iot2050fegateway/tags) on DockerHub.

Assume that, your IOT2050 device has already been installed [docker](https://docs.docker.com/engine/install/) and [docker-compose](https://docs.docker.com/compose/install/). You don't have to pull this Github repository, just copy/download a file `start-service.yml`.

Run this command to pull all prebuilt images and start:

```console
docker-compose -f start-service.yml up -d
```

To remove all running services without saving data, run:

```console
docker-compose -f start-service.yml down -v
```

To remove all running services but keep data insistence, run:

```console
docker-compose -f start-service.yml down
```

To remove all images, run:

```console
docker-compose rmi -f $(docker images -aq)
```

After running services successfully, you can watch this [video](https://www.youtube.com/watch?v=MRA54vUQ7KU) to get a guideline, or try to explore by yourself.

# Deployment guideline

This project must be deployed on Debian v10+ operating system.
Please install **docker**, **docker-compose** before deploying.

In the project directory, change environment mode to production:

```console
bash mode production
```

Then, build images from source code:

```console
docker-compose build
```

If your computer, which is building images, has restrictive RAM, you should not build all images at once. Instead, try to build in sequence.

Finally, to push images to a repository on Docker Hub, visit this [tutorial](https://docs.docker.com/get-started/04_sharing_app/).
