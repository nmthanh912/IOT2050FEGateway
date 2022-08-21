# Target

- Fix bugs
- Enhance source code quality
- Improve performances

## Write API Specifications

We use **Swagger** to spec all APIs
To show the document, run:

```bash
make api_specs
```

To-do list:

- [x] Write API Specs

## Refactor NodejsApp

In version2, we write all logics in controller, hard to read code & debug. We did not validate input data, so in some case it will lead to type mismatching and unexpected error.

We also have two bugs, which relate to SQLite:

- Too many SQL variables (when create many devices with replicate number > 2)
- A SQL query in function `deviceController.editInfo` cause lost data in `SUBSCRIBES` table

Some drawbacks:

- Unefficient update devices (rewrite all tags of a device when only update a config or an info)
- Do not have transaction for many controllers
- Hardcode
- Does not have strictly shellscript to switch mode (development <-> production)
- Does not have Makefile to automate command line job

To-do list:

- [x] Write Makefile
- [x] Rewrite shellscript to switch mode
- [ ] Refactor API convention
- [ ] Separate controller logic into controller & model
- [x] Replace hardcode by variables which are declared in folder `constants`
- [x] Validate & cast type some input (if necessary)
- [x] Seperate partial update device & fully update device
- [x] Resolve function `deviceController.editInfo` (lead to lost data in `SUBSCRIBES` table)
- [x] Wrap many queries in controllers into a transaction
- [ ] Fix bug create OPC_UA tag

## Refactor React App

The application is quite stable now, so in current phase we just modify somethings if required.

## Refactor Protocol Services

In the current version in branch `version2`, we faced off performance problems. Nodejs is not suitable for working with hard device. But in time constraint, we must try to find some optimizations for these services. In the worst case, we must rewrite these services by C++ based on old logics.

Current problems:

- RAM

## Rebuild optimize docker images

- Use multi-stage build
- Restruct repository

Result:

- Images' size decrease 6 times compared to old images' size
- RAM usage of each container decreases by 30MB, there are 7 container => Decrease 210MB RAM usage
