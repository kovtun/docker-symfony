# Docker Symfony (PHP7-FPM - NGINX - MySQL)

## Installation

1. Create a `.env` from the `.env.dist` file. Adapt it according to your symfony application

    ```bash
    $ cp .env.dist .env
    $ nano .env
    ```


2. Source `.env` file and run shell start script `start.sh`

    ```bash
    $ source '.env' && bash 'start.sh'
    ```

3. Update your system host file (add ${PROJECT_HOST_NAME})

    ```bash
    # UNIX only: get containers IP address and update host (replace IP according to your configuration) (on Windows, edit C:\Windows\System32\drivers\etc\hosts)
    $ sudo echo $(docker network inspect bridge | grep Gateway | grep -o -E '[0-9\.]+') ${PROJECT_HOST_NAME} >> /etc/hosts
    ```
