/**
 * Created by serkan on 09/12/16.
 */
/**
 * Created by serkan on 29/08/16.
 */
/**
 * Modified by elehobica
 */
/**
 * Modified by Laryan
 */
exports = module.exports = {};
exports.Bluetooth = function () {
    let self = this;

    let events = require('events');
    events.EventEmitter.call(self);
    self.__proto__ = events.EventEmitter.prototype;

    let pty = require('ptywe.js/lib/pty.js');

    let ransi = require('strip-ansi');

    let term = pty.spawn('bash', [], {
        name: 'xterm-color',
        cols: 100,
        rows: 40,
        cwd: process.env.HOME,
        env: process.env
    });

    let bluetoothEvents = {
        Device: 'DeviceEvent',
        Controller: 'ControllerEvent',
        DeviceSignalLevel: 'DeviceSignalLevel',
        Connected: 'Connected',
        Paired: 'Paired',
        AlreadyScanning: 'AlreadyScanning',
        PassKey: 'PassKey'
    }
    let devices = [];
    let controllers = [];
    let isBluetoothControlExists = false;
    let isBluetoothReady = false;
    let isScanning = false;
    let isConfirmingPassKey = false;

    Object.defineProperty(this, 'isBluetoothControlExists', {
        get: function () {
            return isBluetoothControlExists;
        },
        set: function (value) {
            isBluetoothControlExists = value;
        }
    });

    Object.defineProperty(this, 'isScanning', {
        get: function () {
            return isScanning;
        },
        set: function (value) {
            isScanning = value;
        }
    });
    Object.defineProperty(this, 'isConfirmingPassKey', {
        get: function () {
            return isConfirmingPassKey;
        },
        set: function (value) {
            isConfirmingPassKey = value;
        }
    });
    Object.defineProperty(this, 'isBluetoothReady', {
        get: function () {
            return isBluetoothReady;
        },
        set: function (value) {
            isBluetoothReady = value;
        }
    });
    Object.defineProperty(this, 'devices', {
        get: function () {
            return devices;
        },
        set: function (value) {
            devices = value;
        }
    });
    Object.defineProperty(this, 'controllers', {
        get: function () {
            return controllers;
        },
        set: function (value) {
            controllers = value;
        }
    });
    Object.defineProperty(this, 'bluetoothEvents', {
        get: function () {
            return bluetoothEvents;
        },
        set: function (value) {
            bluetoothEvents = value;
        }
    });

    Object.defineProperty(this, 'term', {
        get: function () {
            return term;
        },
        set: function (value) {
            term = value;
        }
    });

    function checkInfo(obj) {
        if (! obj.isConfirmingPassKey && obj.devices.length > 0) {
            for (i = 0; i < obj.devices.length; i++) {
                if (obj.devices[i].paired == '' && obj.devices[i].trycount < 4) {
                    obj.devices[i].trycount += 1;
                    obj.info(obj.devices[i].mac);
                }
            }
        }
    }

    let os = require('os');
    if (os.platform() == 'linux') {
        term.write('type bluetoothctl\r');
    }


    term.on('data', function (data) {
        data = ransi(data).replace('[bluetooth]#', '');
        if (data.indexOf('bluetoothctl is ') !== -1 && data.indexOf('/usr/bin/bluetoothctl') !== -1) {
            isBluetoothControlExists = true
            isBluetoothReady=true;
            console.log('bluetooth controller exists')
            term.write('bluetoothctl\r');
            term.write('power on\r');
            term.write('agent on\r');
            term.write('devices\r');
            setInterval(checkInfo, 5000, self)
        }
        let regexdevice = /\s?(\[[A-Z]{3,5}\])?\s?Device\s([0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\s(?!RSSI)(?!Name:)(?!Alias:)(?!Class:)(?!Icon:)(?!Paired:)(?!Trusted:)(?!Blocked:)(?!Connected:)(?!LegacyPairing:)(?!not available)(?!UUIDs:)(?!TxPower:)(?!TxPower is nil)(?!ManufacturerData Key:)(?!ManufacturerData Value:)(?![0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})(?!\s)(.+)\s?/gmi;
        let regexcontroller = /\s?\[[A-Z]{3,5}\]?\s?Controller\s([0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\s(?!Discovering)(.+)\s?/gmi;
        let regexsignal = /\s?\[[A-Z]{3,5}\]?\s?Device\s(?<mac>[0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\sRSSI:\s-(?<rssi>.+)\s?/gmi;
        
        let regexconnected = /\s?\[[A-Z]{3,5}\]?\s?Device\s(?<mac>[0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\sConnected:\s(?<connected>[a-z]{2,3})\s?/gmi;
        let regexpaired = /\s?\[[A-Z]{3,5}\]?\s?Device\s(?<mac>[0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\sPaired:\s(?<paired>[a-z]{2,3})\s?/gmi;
        let regextrusted = /\s?\[[A-Z]{3,5}\]?\s?Device\s(?<mac>[0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\sTrusted:\s(?<trusted>[a-z]{2,3})\s?/gmi;
        let regexblocked = /\s?\[[A-Z]{3,5}\]?\s?Device\s(?<mac>[0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2})\sBlocked:\s(?<blocked>[a-z]{2,3})\s?/gmi;
    	let regexpasskeyconfirmation = /\s?\[agent\] Confirm passkey\s(?<mac>[0-9A-F]+)\s[^:]+:\s?/gmi;
        
        let regexinfo = /\s?Device (?<mac>[0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}[\.:-][0-9A-F]{1,2}) \((?<type>.+)\)\r?\n?\t?Name: (?<name>.+)\r?\n?\t?Alias: (?<alias>.+)\r?\n?\t?Class: (?<class>.+)\r?\n?\t?Icon: (?<icon>.+)\r?\n?\t?Paired: (?<paired>.+)\r?\n?\t?Trusted: (?<trusted>.+)\r?\n?\t?Blocked: (?<blocked>.+)\r?\n?\t?Connected: (?<connected>.+)\r?\n?\t?LegacyPairing: (?<legacyPairing>.+)\r?\n?\t?\s?/gmi;
        let regexscanon1 = 'Discovery started';
        let regexscanon2 = 'Failed to start discovery: org.bluez.Error.InProgress';
        let regexscanon3 = 'Discovering: yes';
        let regexscanoff1 = 'Discovery stopped'
        let regexscanoff2 = 'Discovering: no';

        checkDevice(regexdevice, data);
        checkinfo(regexinfo, data);
        checkPaired(regexpaired, data);
        checkSignal(regexsignal, data);
        checkController(regexcontroller, data);
        checkConnected(regexconnected, data);
        checkTrusted(regextrusted, data);
        checkBlocked(regexblocked, data);
        checkPasskeyConfirmation(regexpasskeyconfirmation, data);
        if (data.indexOf(regexscanoff1) !== -1 || data.indexOf(regexscanoff2) !== -1)isScanning = false;
        if (data.indexOf(regexscanon1) !== -1 || data.indexOf(regexscanon2) !== -1 || data.indexOf(regexscanon3) !== -1)isScanning = true;
    })


    function checkBlocked(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - yes or no
            for (j = 0; j < devices.length; j++) {
                if (devices[j].mac == m.groups.mac) {
                    devices[j].blocked = m.groups.blocked;
                    console.log(m.groups.mac + " blocked " + m.groups.blocked)
                    self.emit(bluetoothEvents.Device, devices)
                }
            }
        }
    }

    function checkPaired(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - yes or no
            for (j = 0; j < devices.length; j++) {
                if (devices[j].mac == m.groups.mac) {
                    devices[j].paired = m.groups.paired;
                    console.log(m.groups.mac + " paired " + m.groups.paired)
                    self.emit(bluetoothEvents.Device, devices)
                }
            }
        }
    }

    function checkPasskeyConfirmation(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - passkey
	        console.log("Confirm passkey : " + m.groups.mac);
            self.emit(bluetoothEvents.PassKey, m.groups.mac)
            // confirmPasskey(true);

            isConfirmingPassKey = true;
        }
    }

    function checkTrusted(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - yes or no
            for (j = 0; j < devices.length; j++) {
                if (devices[j].mac == m.groups.mac) {
                    devices[j].trusted = m.groups.trusted;
                    console.log(m.groups.mac + " trusted " + m.groups.trusted)
                    self.emit(bluetoothEvents.Device, devices)
                }
            }
        }
    }

    function checkConnected(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - yes or no
            for (j = 0; j < devices.length; j++) {
                if (devices[j].mac == m.groups.mac) {
                    devices[j].connected = m.groups.connected;
                    console.log(m.groups.mac + " connected " + m.groups.connected)
                    self.emit(bluetoothEvents.Device, devices)
                }
            }
        }
    }

    function checkinfo(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - address type (public, random, private, ...)
            //m[3] - device name
            //m[4] - alias
            //m[5] - Class
            //m[6] - Icon
            //m[7] - paired
            //m[8] - trusted
            //m[9] - blocked
            //m[10] - connected
            //m[11] - legacy pairing
            for (j = 0; j < devices.length; j++) {
                if (devices[j].mac == m.groups.mac) {
                    devices[j].type = m.groups.type
                    devices[j].name = m.groups.name
                    devices[j].alias = m.groups.alias
                    devices[j].class = m.groups.class
                    devices[j].icon = m.groups.icon
                    devices[j].paired = m.groups.paired
                    devices[j].trusted = m.groups.trusted
                    devices[j].blocked = m.groups.blocked
                    devices[j].connected = m.groups.connected
                    devices[j].legacyPairing = m.groups.legacyPairing
                    //console.log('infos for device: ' + m.groups.mac + ' are: ', devices[j]);
                    self.emit(bluetoothEvents.Device, devices)
                }
            }
        }
    }

    function checkSignal(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - signal Level
            for (j = 0; j < devices.length; j++) {
                if (devices[j].mac == m.groups.mac) {
                    devices[j].signal = parseInt(m.groups.rssi)
                    console.log('signal level of:' + m.groups.mac + ' is ' + m.groups.rssi)
                    self.emit(bluetoothEvents.Device, devices)
                    self.emit(bluetoothEvents.DeviceSignalLevel, devices, m.groups.mac, m.groups.rssi);
                }
            }
        }
    }

    function checkController(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - macid
            //m[2] - controllername
            controllers = [];
            controllers.push({mac: m[1], name: m[2]});
            self.emit(bluetoothEvents.Controller, controllers);
            console.log('controller found:' + m[1])
            term.write('power on\r');
            term.write('agent on\r');
        }
    }

    function checkDevice(regstr, data) {
        let m = null;
        while ((m  = regstr.exec(data)) !== null) {
            if (m.index === regstr.lastIndex) {
                regstr.lastIndex++;
            }
            //m[1] - [NEW] or [DEL] etc..
            //m[2] - macid
            //m[3] - devicename
            if (m[1] == "[DEL]") {
                //remove from list
                if (devices.length > 0) {
                    for (j = 0; j < devices.length; j++) {
                        if (devices[j].mac == m[2]) {
                            devices.splice(j, 1);
                            console.log('deleting device ' + m[2])
                        }
                    }
                }
            } else if(m[1] != "[CHG]"){
                let found = false;
                if (devices.length > 0) {
                    for (j = 0; j < devices.length; j++) {
                        if (devices[j].mac == m[2])found = true;
                        if (devices[j].mac == m[2] && m[1] == "[NEW]")found = false;
                    }
                }
                if (!found) {
                    //console.log('adding device ' + m[2])
                    devices.push({
                        mac: m[2],
                        name: m[3],
                        signal: 0,
                        paired: '',
                        trusted: '',
                        icon: '',
                        class: '',
                        blocked: '',
                        connected: '',
                        trycount: 0
                    });
                }
            }
        }
        if ((regstr.exec(data)) !== null) self.emit(bluetoothEvents.Device, devices)
    }
}

exports.agent = function (start) {
    this.term.write('agent ' + (start ? 'on' : 'off') + '\r');
}

exports.power = function (start) {
    this.term.write('power ' + (start ? 'on' : 'off') + '\r');
}

exports.scan = function (startScan) {
    this.term.write('scan ' + (startScan ? 'on' : 'off') + '\r');
}
exports.pairable = function (canpairable) {
    this.term.write('pairable ' + (canpairable ? 'on' : 'off') + '\r');
}
exports.discoverable = function (candiscoverable) {
    this.term.write('discoverable ' + (candiscoverable ? 'on' : 'off') + '\r');
}


exports.pair = function (macID) {
    this.term.write('pair ' + macID + '\r');
}
exports.confirmPassKey = function (confirm) {
    this.isConfirmingPassKey = false;
    this.term.write(confirm ? 'yes\r' : 'no\r');
}

exports.trust = function (macID) {
    this.term.write('trust ' + macID + '\r');
}

exports.untrust = function (macID) {
    this.term.write('untrust ' + macID + '\r');
}


exports.block = function (macID) {
    this.term.write('block ' + macID + '\r');
}
exports.unblock = function (macID) {
    this.term.write('unblock ' + macID + '\r');
}


exports.connect = function (macID) {
    this.term.write('connect ' + macID + '\r');
}

exports.disconnect = function (macID) {
    this.term.write('disconnect ' + macID + '\r');
}

exports.remove = function (macID) {
    this.term.write('remove ' + macID + '\r');
}

exports.info = function (macID) {
    this.term.write('info ' + macID + '\r');
}


exports.getPairedDevices = function () {
    this.devices = [];
    this.term.write('paired-devices\r');
}

exports.getDevicesFromController = function () {
    this.devices = [];
    this.term.write('devices\r');
}

exports.checkBluetoothController=function(){
    try{
        let execSync = require("child_process").execSync;
        return !!execSync("type bluetoothctl", {encoding: "utf8"});
    }
    catch(e){
        return false;
    }
}