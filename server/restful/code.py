import web
import sys
import os
sys.path.append(os.path.abspath(os.path.dirname(__file__)))
import json
import requests
import logging
import cecommand

log_format = '%(filename)s %(funcName)s %(asctime)s %(message)s'
log_filename = "/var/www/mqtt_demo/restful/debug.log"
logging.basicConfig(filename=log_filename, format=log_format, datefmt='%Y-%m-%d %H:%M:%S:%S %p', filemode='a', level=logging.DEBUG)



urls = (
    '/devicestatus', 'devicestatus',
    '/command', 'command',
    )

class devicestatus:
    def GET(self):
        url = r"https://f12w3m8f3b.execute-api.us-west-2.amazonaws.com/beta/devicestatus"
        req = requests.get(url, verify=False)
	return req.content.strip("\"").replace('\\', '')

class command:
    def POST(self):
	respstr = "error"
	try:
		logging.debug(web.data())
		respstr =cecommand.push_cmd(json.loads(web.data()))
	except Exception, e:
		logging.error('push fail')
		logging.error(e)
	logging.debug(respstr)
	return respstr


application = web.application(urls, globals()).wsgifunc()
