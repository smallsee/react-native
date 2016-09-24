'use strict'

var quertString = require('query-string');
var _ = require('lodash');
var Mock = require('mockjs');
var config = require('./config');
var request ={};

request.get = function(url,params){
    if (params){
        url += '?' + quertString.stringify(params)
    }

    return fetch(url)
        .then((response) => response.json())
        .then((response) => Mock.mock(response))
};


request.post = function(url,body){

    var options = _.extend(config.header,{
        body: JSON.stringify(body)
    })

    return fetch(url,options)
        .then((response) => response.json())
        .then((response) => Mock.mock(response))
};


//noinspection JSUnresolvedVariable
module.exports = request;