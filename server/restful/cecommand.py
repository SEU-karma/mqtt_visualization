import AWSIoTPythonSDK
import uuid
import mqttclient
import json
import logging
import time
import logging


log_format = '%(filename)s %(funcName)s %(asctime)s %(message)s'
log_filename = "/var/www/mqtt_demo/restful/debug.log"
logging.basicConfig(filename=log_filename, format=log_format, datefmt='%Y-%m-%d %H:%M:%S:%S %p', filemode='a', level=logging.DEBUG)

def push_cmd(cmd):
	cmd['guid'] = cmd['guid'].encode('utf8')
	cmd['callback_name'] = cmd['callback_name'].encode('utf8')
	guid = cmd['guid']
	timeout = 50
    topic = "commands/" + guid
    logging.debug("topic:"+topic)
	try:
		client = mqttclient.MqttClient.GetInstance()
	except Exception, e:
		logging.error(e)
		return
	response = {} 
	response['ack'] = 0
	response['content'] = json.dumps({'status':'response timeout'})
    response['guid'] = guid
	def resultcallback(client, usiqaerdata, message):
		response['ack'] = 1
		response['content'] = message.payload
		
	cmd['prefix_id'] = str(uuid.uuid1())
	cmd['callback_data'] = ''
	logging.debug(json.dumps(cmd))
	subscribetopic= "commandresult/"+guid+"/"+cmd['prefix_id'] 
	subscribetopic = subscribetopic.encode('utf8')
	try:
		logging.error('publish command ')
		client.subscribe(subscribetopic, 1 , resultcallback)
		mqttclient.MqttClient.Publish(topic, json.dumps(cmd))

	except Exception,e:
		logging.error('publish command fail')
		logging.error(e)
	while timeout > 0 and response['ack'] == 0:
        timeout = timeout - 1
		logging.debug('waitting')
		time.sleep(0.1)
	logging.debug('push finish')
	#client.unsubscribe(subscribetopic)
	response['cmdname'] = cmd['callback_name']
	return response



if __name__ == "__main__":
	cmd = {}
	cmd['callback_name'] = 'invalid cmd'
	cmd['guid'] = '4265c04a-d87d-11e6-a875-005056ba1867'
	push_cmd(cmd)
	time.sleep(2)
