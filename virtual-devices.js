const {
  Action,
  Event,
  MultipleThings,
  Property,
  Thing,
  Value,
  WebThingServer,
} = require('webthing');

class OverheatedEvent extends Event {
  constructor(thing, data) {
    super(thing, 'overheated', data);
  }
}

class FadeAction extends Action {
  constructor(thing, input) {
    super(thing, 'fade', input);
  }

  performAction() {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.thing.setProperty('brightness', this.input.brightness);
        this.thing.addEvent(new OverheatedEvent(this.thing, 102));
        resolve();
      }, this.input.duration);
    });
  }
}

class DimmableLight extends Thing {
  constructor() {
    super(
      'urn:dev:ops:lamp-1234',
      'Lamp',
      ['OnOffSwitch', 'Light'],
      'A web connected lamp'
    );

    this.addProperty(
      new Property(
         this,
        'on',
        new Value(true, (v) => console.log('On-State is now', v)),
        {
          '@type': 'OnOffProperty',
          title: 'On/Off',
          type: 'boolean',
          description: 'Whether the lamp is turned on',
        }));

    this.addProperty(
      new Property(
        this,
        'brightness',
        new Value(50, (v) => console.log('Brightness is now', v)),
        {
          '@type': 'BrightnessProperty',
          title: 'Brightness',
          type: 'integer',
          description: 'The level of light from 0-100',
          minimum: 0,
          maximum: 100,
          unit: 'percent',
        }));

    this.addAvailableAction(
      'fade',
      {
        title: 'Fade',
        description: 'Fade the lamp to a given level',
        input: {
          type: 'object',
          required: [
            'brightness',
            'duration',
          ],
          properties: {
            brightness: {
              type: 'integer',
              minimum: 0,
              maximum: 100,
              unit: 'percent',
            },
            duration: {
              type: 'integer',
              minimum: 1,
              unit: 'milliseconds',
            },
          },
        },
      },
      FadeAction);

    this.addAvailableEvent(
      'overheated',
      {
        description: 'The lamp has exceeded its safe operating temperature',
        type: 'number',
        unit: 'degree celsius',
      });
  }
}

class PresenceSensor extends Thing {
  constructor() {
    super(
      'urn:dev:ops:presence-sensor-1234',
      'Presence Sensor',
      ['BinarySensor'],
      'A web connected presence sensor'
    );

    this.addProperty(
      new Property(
         this,
        'presence',
        new Value(true, (v) => console.log('presence:', v)),
        {
          '@type': 'BooleanProperty',
          title: 'presence',
          type: 'boolean',
          description: 'Whether user is home',
        }));
    setInterval(() => {
        const newpresence = this.randomboolean();
          console.log('setting new presence situation:', newpresence);
          this.presence = newpresence;
    }, 50000);
  }
  randomboolean(){
    if(Math.round(Math.random())==0){
      return false;
    }
    else{
      return true;
    }
  }
}

class Window extends Thing {
  constructor() {
    super(
      'urn:dev:ops:window-1234',
      'Window',
      ['OnOffSwitch'],
      'A web connected window'
    );

    this.addProperty(
      new Property(
         this,
        'on',
        new Value(true, (v) => console.log('On-State of window is now', v)),
        {
          '@type': 'OnOffProperty',
          title: 'On/Off',
          type: 'boolean',
          description: 'Whether the window is open',
        }));
  }
}

function runServer() {
  const LivingroomLight = new DimmableLight();

  const BedroomLight = new DimmableLight();

  const presentsensor = new PresenceSensor();

  const webwindow = new Window();
  
  const server = new WebThingServer(new MultipleThings([LivingroomLight, BedroomLight, presentsensor, webwindow],
                                                       'LightAndWindow'),
                                    8888,"47.114.123.108");

  process.on('SIGINT', () => {
    server.stop().then(() => process.exit()).catch(() => process.exit());
  });

  server.start().catch(console.error);
}

runServer();
