#!/usr/bin/env python
import sys, os, time
import random
import json
import threading
import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
from daemon import Daemon
import logging
import threading
import mqttclient

log_format = '%(filename)s %(funcName)s %(asctime)s %(message)s'
log_filename = "/var/www/mqtt_demo/restful/debug.log"
logging.basicConfig(filename=log_filename, format=log_format, datefmt='%Y-%m-%d %H:%M:%S:%S %p', filemode='a', level=logging.DEBUG)



 

class AwsActionListener(threading.Thread):
    def actionCallback(self, client, usiqaerdata, message):
        logging.debug(message.payload)
        result =  json.loads(message.payload)

    def run(self):
        self.guid = r"4265c04a-d87d-11e6-a875-005056ba1862" 
        client = mqttclient.MqttClient.GetInstance()     
        client.subscribe("commandresult/1/1", 1, self.actionCallback)
        while True:
            time.sleep(1)
        
class AwsIOTDaemon(Daemon):
    def run(self):
        os.chdir(os.path.dirname(os.path.realpath(__file__)))
        logging.debug('AwsActionListener daemon run')
        try:
            pf = open(self.pidfile,'r')
            pid = int(pf.read().strip())
            pf.close()
        except IOError:
            pid = None

        if not pid:
            logging.error('pid is not existed, something wrong with create pid file, no need to run daemon, exit')
            return
        else:
            logging.debug('AwsIOTDaemon process start, pid is %s', str(pid))

        try:
            awsactionlistener = AwsActionListener()
            awsactionlistener.start()
            awsactionlistener.join()

        except Exception, e:
            logging.error('threads crash with unexcepted error, daemon exit')

        return


if __name__ == "__main__":
    logging.debug(os.path.dirname(os.path.realpath(__file__)) + '/mqtt_daemon.pid') 
    daemon = AwsIOTDaemon(os.path.dirname(os.path.realpath(__file__)) + '/mqtt_daemon.pid')
    if len(sys.argv) == 2:
        if 'start' == sys.argv[1]:
                daemon.start()
        elif 'stop' == sys.argv[1]:
                daemon.stop()
        elif 'restart' == sys.argv[1]:
                daemon.restart()
        else:
                logging.error("Unknown command")
                sys.exit(2)
    else:
        #print "usage: %s start|stop|restart" % sys.argv[0]
        logging.error('usage: mqtt.py start|stop|restart')
        sys.exit(2)

