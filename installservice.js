//https://github.com/coreybutler/node-windows

const sgMail = require('@sendgrid/mail');
var Service = require('node-windows').Service;
var EventLogger = require('node-windows').EventLogger;
var log = new EventLogger('DemoApi');
var email = "jkh@narola.email";

var sendmail = function (to, subject, text) {
    sgMail.setApiKey('yoursendgridapikey');
    const msg = {
        to: to,
        from: 'noreply@demoapi.com',
        subject: subject,
        text: text,
    };
    try {
        sgMail.send(msg);
    } catch (ex) {

    }
};

// Create a new service object
var svc = new Service({
    name: 'DemoApi Node WebServer',
    description: 'Sevice for the nodejs web server for DemoApi.',
    script: 'F:\\Learning\\node\\DemoApi\\src\\server.js',
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
});

svc.on('install', function () {
    log.info("Install complete.");
    console.log('Install complete.');
    svc.start();
});

svc.on('alreadyinstalled', function () {
    log.info("Service is already installed.");
    console.log('Service is already installed.');
});

svc.on('uninstall', function () {
    log.info("Uninstall complete.");
    console.log('Uninstall complete.');
    console.log('Is service exists?', svc.exists);
});

svc.on('alreadyuninstalled', function () {
    log.info("Service is already uninstalled.");
    console.log('Service is already uninstalled.');
});

svc.on('start', function () {
    log.info("Service started.");
    console.log('Service started.');
    //sendmail(email, "Service started", "DemoApi service is started.");
});

svc.on('stop', function () {
    log.info("Service stopped.");
    console.log('Service stopped.');
    //sendmail(email, "Service stopped", "DemoApi service is stopped.");
});

svc.on('error', function () {
    log.info("Error occured in service.");
    console.log('Error occured in service.');
    //sendmail(email, "Service error", "Some error occured in DemoApi service.");
});

//Install the service
//svc.install();

// Uninstall the service.
svc.uninstall();