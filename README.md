# iw-nikaple-server

## 简介

## 使用方法

1.  确认你拥有公网 IP

2.  如果使用了云服务器，确认云主机的 3738 端口已经打开

3.  安装 [Docker](https://docs.docker-cn.com/engine/installation/)

    1.  如果没有云服务器，可以考虑使用云服务器服务商提供的预装环境。
    2.  如果你已经有云服务器，相信你自己也可以把 `docker` 安装好的

    以 CentOS 为例，安装命令如下：

    ```bash
    # 清除已安装的 Docker 包
    $ sudo yum remove docker \
                      docker-client \
                      docker-client-latest \
                      docker-common \
                      docker-latest \
                      docker-latest-logrotate \
                      docker-logrotate \
                      docker-selinux \
                      docker-engine-selinux \
                      docker-engine

    # 安装必要的依赖
    $ sudo yum install -y yum-utils \
      device-mapper-persistent-data \
      lvm2
    # 添加 Docker 仓库
    $ sudo yum-config-manager \
        --add-repo \
        https://download.docker.com/linux/centos/docker-ce.repo
    # 安装 Docker
    $ sudo yum install docker-ce
    # 启动 Docker 服务
    $ sudo systemctl start docker
    ```

    可以用以下命令验证`docker`是否安装成功：

    ```bash
    $ sudo docker run hello-world
    ```

4.  安装 [Docker-Compose](https://docs.docker-cn.com/compose/install/)

    ```bash
    $ curl -L https://github.com/docker/compose/releases/download/1.21.1/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
    $ chmod +x /usr/local/bin/docker-compose
    ```

    用以下命令验证`docker-compose`是否安装成功：

    ```bash
    $ docker-compose --version
    ```

5.  拉取服务端代码。

    ```bash
    $ git clone https://github.com/Nikaple/iw-nikaple-server.git
    ```

6.  启动服务器

    ```bash
    $ docker-compose up
    ```

    如果在启动过程中出现错误，可以考虑按照如下方式注释掉部分代码：

    ```dockerfile
    ...
    RUN npm install -g pm2 # --registry=https://registry.npm.taobao.org
    RUN yarn # --registry https://registry.npm.taobao.org
    ...
    ```

    ​
