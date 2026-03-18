FROM kalilinux/kali-rolling

RUN apt update && apt install -y \
    netcat-openbsd \
    socat \
    nikto \
    nmap \
    curl \
    iputils-ping \
    bash

CMD ["/bin/bash"]