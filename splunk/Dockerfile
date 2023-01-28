FROM splunk/splunk:7.0.0

COPY ./server.conf /opt/splunk/etc/system/local/server.conf

COPY --chown=splunk:splunk ./inputs.conf /opt/splunk/etc/system/local/inputs.conf

EXPOSE 8000
