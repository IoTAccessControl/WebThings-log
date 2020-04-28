const { Thing, Property, Value, WebThingServer, SingleThing } = require('webthing');

const light = new Thing('urn:dev:ops:my-lamp-1234', 'My Lamp',
	  ['OnOffSwitch', 'Light'], 'A web connected lamp');

light.addProperty(new Property(light, 'on',
	  new Value(true, v => console.log('On-State is now', v)), {
		      '@type': 'OnOffProperty',
		      title: 'On/Off',
		      type: 'boolean',
		      description: 'Whether the lamp is turned on',
	  }));
light.addProperty(new Property(light, 'brightness',
	  new Value(50, v => console.log('Brightness is now', v)), {
		      '@type': 'BrightnessProperty',
		      title: 'Brightness',
		      type: 'number',
		      description: 'The level of light from 0-100',
		      minimum: 0,
		      maximum: 100,
		      unit: 'percent',
	  }));

const server = new WebThingServer(new SingleThing(light), 8888, "47.114.123.108");
process.on('SIGINT', () => {
	  server.stop().then(() => process.exit()).catch(() => process.exit());
});
server.start().catch(console.error);
