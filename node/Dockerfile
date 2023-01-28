FROM node:latest

COPY ./supervisord.conf /etc/supervisor/conf.d/

COPY ./req.js /root/req.js

WORKDIR /app

COPY ./src .

#RUN npm install --omit=dev

RUN mkdir /var/log/node && touch /var/log/node/access.log

RUN apt update && apt install -y \
	openssh-server \
	supervisor \
	cron

RUN mkdir /var/run/sshd

RUN chmod 0755 /var/run/sshd

RUN useradd -m -s /bin/bash -u 1001 superadmin

RUN echo 'superadmin:abcdef' | chpasswd

RUN echo 'root:rootenpotato' | chpasswd

RUN echo '* * * * * /usr/local/bin/node /root/req.js' | crontab -

RUN sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config

EXPOSE 5000

ENTRYPOINT ["/usr/bin/supervisord", "-n", "-c", "/etc/supervisor/supervisord.conf"]

