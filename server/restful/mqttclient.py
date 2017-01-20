import json
import threading
import datetime
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient
import logging
import threading
import uuid
def mylog(a, userdata, level,buf):
        logging.debug(buf)


class MqttClient():
    mqttclient=None
    mutex=threading.Lock()
    def __init__(self):
        pass
    @staticmethod
    def GetInstance():
        if(MqttClient.mqttclient==None):
            MqttClient.mutex.acquire()
            if(MqttClient.mqttclient==None):
                rootCAPath = r"/home/mqtt/cert/3-Public-Primary-Certification-Authority-G5.pem"
                host = r""
                obtainedAccessKeyID = ""
                obtainedSecretAccessKey = ""
                obtainedSessionToken = ""
                mqttclient = AWSIoTMQTTClient(str(uuid.uuid1()), useWebsocket = True)
                mqttclient.configureEndpoint(host, 443)
                mqttclient.configureCredentials(rootCAPath)
                mqttclient.configureAutoReconnectBackoffTime(1, 32, 20)
                mqttclient.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
                mqttclient.configureDrainingFrequency(10)  # Draining: 2 Hz
                mqttclient.configureConnectDisconnectTimeout(10)  # 10 sec
                mqttclient.configureMQTTOperationTimeout(10)  # 10 sec
                mqttclient.configureIAMCredentials(obtainedAccessKeyID, obtainedSecretAccessKey, obtainedSessionToken)
                mqttclient._mqttCore._pahoClient.on_log=  mylog
                MqttClient.mqttclient = mqttclient
                try:
                    mqttclient.connect()
                except Exception,e:
                    logging.error('mqttclient connect error')
                    logging.error(e)
            MqttClient.mutex.release()

        return MqttClient.mqttclient

    @staticmethod
    def Publish(topic, message):
        MqttClient.GetInstance().publish(topic, message, 1)

