// Test service option features

const dbus = require('../../');
const Variant = dbus.Variant;
const DBusError = dbus.DBusError;

const {
  Interface, property, method, signal
} = dbus.interface;

const TEST_NAME = 'org.test.service_options';
const TEST_PATH = '/org/test/path';
const TEST_IFACE = 'org.test.iface';

const bus = dbus.sessionBus();
bus.on('error', (err) => {
  console.log(`got unexpected connection error:\n${err.stack}`);
});

class OptionsTestInterface extends Interface {
  @method({ disabled: true })
  DisabledMethod () {
  }

  @method({ name: 'SomeMethod', inSignature: 's', outSignature: 's' })
  methodNamedDifferently (what) {
    return what;
  }

  @signal({ name: 'RenamedSignal', signature: 's' })
  signalNamedDifferently (what) {
    return what;
  }

  @method({})
  EmitRenamedSignal () {
    this.signalNamedDifferently('hello');
  }

  @signal({ disabled: true, outSignature: 'd' })
  DisabledSignal (what) {
    return what;
  }

  @property({ name: 'SomeProperty', signature: 's' })
  propertyNamedDifferently = 'SomeProperty';

  @property({ disabled: true, signature: 's' })
  DisabledProperty = 'DisabledProperty';
}

const testIface = new OptionsTestInterface(TEST_IFACE);

beforeAll(async () => {
  await bus.requestName(TEST_NAME);
  bus.export(TEST_PATH, testIface);
});

afterAll(() => {
  bus.disconnect();
});

test('renamed and disabled property requests', async () => {
  const object = await bus.getProxyObject(TEST_NAME, TEST_PATH);
  const properties = object.getInterface('org.freedesktop.DBus.Properties');

  let req = await properties.GetAll(TEST_IFACE);
  // this property was renamed
  expect(req).not.toHaveProperty('propertyNamedDifferently');
  // this property is disabled
  expect(req).not.toHaveProperty('DisabledProperty');
  // the renamed one should show up
  expect(req).toHaveProperty('SomeProperty');

  req = properties.Get(TEST_IFACE, 'propertyNamedDifferently');
  await expect(req).rejects.toThrow(DBusError);
  req = properties.Get(TEST_IFACE, 'DisabledProperty');
  await expect(req).rejects.toThrow(DBusError);
  req = properties.Get(TEST_IFACE, 'SomeProperty');
  await expect(req).resolves.toEqual(new Variant('s', testIface.propertyNamedDifferently));

  req = properties.Set(TEST_IFACE, 'propertyNamedDifferently', new Variant('s', testIface.propertyNamedDifferently));
  await expect(req).rejects.toThrow(DBusError);
  req = properties.Set(TEST_IFACE, 'DisabledProperty', new Variant('s', 'disabled'));
  await expect(req).rejects.toThrow(DBusError);
  req = properties.Set(TEST_IFACE, 'SomeProperty', new Variant('s', testIface.propertyNamedDifferently));
  await expect(req).resolves.toEqual(null);
});

test('renamed and disabled methods', async () => {
  const object = await bus.getProxyObject(TEST_NAME, TEST_PATH);
  const iface = await object.getInterface(TEST_IFACE);

  expect(iface).not.toHaveProperty('DisabledMethod');
  expect(iface).not.toHaveProperty('methodNamedDifferently');
  expect(iface).toHaveProperty('SomeMethod');
  const testStr = 'what';
  const req = iface.SomeMethod(testStr);
  await expect(req).resolves.toEqual(testStr);
});

test('renamed and disabled signals', async () => {
  const object = await bus.getProxyObject(TEST_NAME, TEST_PATH);
  const iface = await object.getInterface(TEST_IFACE);

  const onRenamedSignal = jest.fn(() => {});
  iface.on('RenamedSignal', onRenamedSignal);

  await iface.EmitRenamedSignal();

  expect(onRenamedSignal).toHaveBeenCalledWith('hello');
});
