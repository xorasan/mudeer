// Test a service configured with Interface.configureMembers()

const dbus = require('../../');
const Variant = dbus.Variant;

const TEST_NAME = 'org.test.configured_service';
const TEST_PATH = '/org/test/path';
const TEST_IFACE = 'org.test.iface';

const Interface = dbus.interface.Interface;

const bus = dbus.sessionBus();
bus.on('error', (err) => {
  console.log(`got unexpected connection error:\n${err.stack}`);
});

class ConfiguredTestInterface extends Interface {
  constructor (name) {
    super(name);
    this._someProperty = 'foo';
  }

  get SomeProperty () {
    return this._someProperty;
  }

  set SomeProperty (value) {
    this._someProperty = value;
  }

  Echo (what) {
    return what;
  }

  HelloWorld () {
    return ['hello', 'world'];
  }

  EmitSignals () {
    this.HelloWorld();
  }
}

ConfiguredTestInterface.configureMembers({
  properties: {
    SomeProperty: {
      signature: 's'
    }
  },
  methods: {
    Echo: {
      inSignature: 'v',
      outSignature: 'v'
    },
    EmitSignals: {}
  },
  signals: {
    HelloWorld: {
      signature: 'ss'
    }
  }
});

const testIface = new ConfiguredTestInterface(TEST_IFACE);

beforeAll(async () => {
  await bus.requestName(TEST_NAME);
  bus.export(TEST_PATH, testIface);
});

afterAll(() => {
  bus.disconnect();
});

test('regression: getter is not called after configureMembers (#60)', () => {
  class TestInterface extends Interface {
    constructor (name) {
      super(name);
      this._myPrivateProperty = 'HELLO';
    }

    get myProperty () {
      return this._myPrivateProperty.toLowerCase();
    }
  }

  TestInterface.configureMembers({
    properties: {
      myProperty: { signature: 's' }
    }
  });
});

test('configured interface', async () => {
  const object = await bus.getProxyObject(TEST_NAME, TEST_PATH);
  const test = object.getInterface(TEST_IFACE);
  expect(test).toBeDefined();
  const properties = object.getInterface('org.freedesktop.DBus.Properties');

  const prop = await properties.Get(TEST_IFACE, 'SomeProperty');
  expect(prop).toBeInstanceOf(Variant);
  expect(prop.signature).toEqual('s');
  expect(prop.value).toEqual('foo');
  expect(prop.value).toEqual(testIface.SomeProperty);

  await properties.Set(TEST_IFACE, 'SomeProperty', new Variant('s', 'bar'));
  expect(testIface.SomeProperty).toEqual('bar');

  const result = await test.Echo(new Variant('s', 'foo'));
  expect(result).toBeInstanceOf(Variant);
  expect(result.signature).toEqual('s');
  expect(result.value).toEqual('foo');

  const onHelloWorld = jest.fn();
  test.once('HelloWorld', onHelloWorld);

  await test.EmitSignals();
  expect(onHelloWorld).toHaveBeenCalledWith('hello', 'world');
});
