#!/usr/bin/env node 
const express = require('express');
const https = require("https"), fs = require("fs");
const {RtcTokenBuilder, RtmTokenBuilder, RtcRole} = require('agora-access-token');

const PORT = 8080;
const APP_ID = "3f98d7eba3f04930a0536a51dff596aa"
const APP_CERTIFICATE = "7c16e8ffada741118a8affcf54d1efa9";

const app = express();
const options = {
  key: fs.readFileSync("/etc/letsencrypt/live/dewagitexvr.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/dewagitexvr.com/fullchain.pem")
};

//apply the response headers, that force the browser to never cache the response so we ensure we always get a fresh token
const nocache = (req, resp, next) => {
    resp.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    resp.header('Expires', '-1');
    resp.header('Pragma', 'no-cache');
    next();
};

//handle the request and return the JSON response
const generateAccessToken = (req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');

    const channelName = req.query.channelName;
    if (!channelName) {
        return resp.status(500).json({'error': 'channel is required'});
    }

    // get uid 
    let uid = req.query.uid;
    if (!uid || uid == '') {
        uid = 0;
    }
    // get role
    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
    }
    // get the expire time 1 hour
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    
    return resp.json({'token': token});


};

const generateAccessTokenRTM = (req, resp) => {
    resp.header('Access-Control-Allow-Origin', '*');

    // get uid 
    let uid = req.query.uid;
    if (!uid || uid == '') {
        uid = 0;
    }
    // get role
    let role = RtcRole.SUBSCRIBER;
    if (req.query.role == 'publisher') {
        role = RtcRole.PUBLISHER;
    }
    // get the expire time 1 hour
    let expireTime = req.query.expireTime;
    if (!expireTime || expireTime == '') {
        expireTime = 3600;
    } else {
        expireTime = parseInt(expireTime, 10);
    }
    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000);
    const privilegeExpireTime = currentTime + expireTime;
    
    const token = RtmTokenBuilder.buildToken(APP_ID, APP_CERTIFICATE, uid, role, privilegeExpireTime);
    //const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channelName, uid, role, privilegeExpireTime);
    
    return resp.json({'token': token});


};

//define a get
app.get('/access_token_rtc', nocache, generateAccessToken);

app.get('/access_token_rtm', nocache, generateAccessTokenRTM);

//lister method: callback once the server is ready and listening on the given port
/*app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});
 * 
 */

https.createServer(options, app).listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

